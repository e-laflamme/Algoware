from transformers import BertTokenizerFast, BertForSequenceClassification
import torch

model_path = "./topic_classifier_bert"

tokenizer = BertTokenizerFast.from_pretrained(model_path)
model = BertForSequenceClassification.from_pretrained(model_path)
model.eval()

# assuming 26 topics
id2label = model.config.id2label

def predict_topic(title, transcript):
    text = title + " " + transcript
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding="max_length", max_length=512)

    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        predicted_class_id = torch.argmax(logits, dim=-1).item()

    return id2label[predicted_class_id]

