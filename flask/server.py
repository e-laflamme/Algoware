import os
import re
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from pytube import YouTube
from youtube_transcript_api import YouTubeTranscriptApi
from model import predict_topic
from urllib.parse import urlparse, parse_qs
from google.cloud import language_v1

# ✅ Automatically load Google NLP key
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "flask/credentials/google_nlp_key.json"

app = Flask(__name__)
CORS(app)

def extract_video_id(url):
    match = re.search(r"(?:v=|\/)([0-9A-Za-z_-]{11})", url)
    return match.group(1) if match else None

def get_video_title(url):
    oembed_url = f"https://www.youtube.com/oembed?url={url}&format=json"
    try:
        res = requests.get(oembed_url)
        res.raise_for_status()
        return res.json()['title']
    except Exception as e:
        print(f"❌ Title fetch error for {url}: {e}")
        return None

def get_transcript(video_id):
    try:
        return " ".join([entry['text'] for entry in YouTubeTranscriptApi.get_transcript(video_id, languages=['en'])])
    except Exception as e:
        print(f"⚠️ Direct EN transcript failed for {video_id}: {e}")
        try:
            transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
            for transcript in transcript_list:
                if transcript.is_translatable:
                    try:
                        translated = transcript.translate('en')
                        return " ".join([entry['text'] for entry in translated.fetch()])
                    except Exception as e2:
                        print(f"⚠️ Translate error: {e2}")
        except Exception as e3:
            print(f"❌ Transcript fetch error for {video_id}: {e3}")
        return None

def get_title_and_transcript(video_url):
    print(f"\n🔎 Processing: {video_url}")
    video_id = extract_video_id(video_url)
    if not video_id:
        print(f"❌ Invalid video ID")
        return None, None

    title = get_video_title(video_url)
    transcript = get_transcript(video_id)

    if not title:
        print(f"❌ No title fetched")
    if not transcript:
        print(f"❌ No transcript fetched")

    return title, transcript

def get_sentiment_breakdown(text):
    client = language_v1.LanguageServiceClient()
    document = language_v1.Document(content=text, type_=language_v1.Document.Type.PLAIN_TEXT)
    sentiment = client.analyze_sentiment(request={"document": document}).document_sentiment
    score = sentiment.score

    positive = max(score, 0)
    negative = abs(min(score, 0))
    neutral = 1 - (positive + negative)
    total = positive + negative + neutral

    return {
        "positive": round((positive / total) * 100, 2),
        "negative": round((negative / total) * 100, 2),
        "neutral": round((neutral / total) * 100, 2)
    }

@app.route("/predict", methods=["POST"])
def predict():
    urls = request.json.get("input", [])
    print(f"\n📥 Received {len(urls)} URLs")

    video_results = []

    for url in urls:
        title, transcript = get_title_and_transcript(url)
        if title and transcript:
            try:
                topic = predict_topic(title, transcript)
                print(f"✅ Predicted topic: {topic}")
                combined_text = f"{title}\n\n{transcript}"
                sentiment = get_sentiment_breakdown(combined_text)

                print(f"🧠 Sentiment for {title} → {sentiment}")
                
                video_results.append({
                    "url": url,
                    "title": title,
                    "topic": topic,
                    "sentiment": sentiment
                })

            except Exception as e:
                print(f"❌ Error processing {url}: {e}")
        else:
            print(f"⚠️ Skipped due to missing title/transcript: {url}")

    topic_counts = {}
    for video in video_results:
        topic = video["topic"]
        topic_counts[topic] = topic_counts.get(topic, 0) + 1

    return jsonify({
        "prediction": topic_counts,
        "results": video_results
    })

if __name__ == "__main__":
    app.run(debug=True)