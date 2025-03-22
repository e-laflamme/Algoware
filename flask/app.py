from flask import Flask, jsonify, request
from model import get_prediction

# Initialize the Flask app
app = Flask(__name__)

# Dummy route to test if the server is running
@app.route('/')
def hello_world():
    return 'Hello, World!'

# A POST route to get predictions (dummy prediction for now)
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        input_value = data.get("input")  # Get input from the request body
        
        # Simulate a model prediction (replace with actual model prediction logic)
        prediction = get_prediction(input_value)  
        
        # Return the prediction as a JSON response
        return jsonify({"prediction": prediction})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True)
