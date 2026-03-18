from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import random
import polyline

app = Flask(__name__)
CORS(app)

ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjJjNzRkY2I2MjUzMGFhYWM1NDAxMDQxNmYzYzcwZTIxZTZhZGQzZTBlZmI5MDBkZmJlZmI3MDJlIiwiaCI6Im11cm11cjY0In0="

# --------- ACO SIMULATION ----------
def aco_routes():
    pheromone_levels = [random.uniform(0.1,1.0) for i in range(5)]
    routes = [p for p in pheromone_levels if p > 0.3]
    return len(routes)


# --------- SHORTEST ROUTE ----------
def get_shortest_route(start, end):

    url = "https://api.openrouteservice.org/v2/directions/driving-car"

    headers = {
        "Authorization": ORS_API_KEY,
        "Content-Type": "application/json"
    }

    body = {
        "coordinates": [start, end]
    }

    response = requests.post(url, json=body, headers=headers)
    data = response.json()

    distance = data["routes"][0]["summary"]["distance"]

    encoded_geometry = data["routes"][0]["geometry"]

    # decode polyline to coordinates
    coords = polyline.decode(encoded_geometry)

    return distance, coords


@app.route("/route", methods=["POST"])
def route():

    data = request.json

    start = data["start"]
    end = data["end"]

    routes_found = aco_routes()

    distance, coords = get_shortest_route(start, end)

    return jsonify({
        "routes_found": routes_found,
        "distance": distance,
        "coordinates": coords
    })


@app.route("/test")
def test():
    return {"message": "Backend connected"}


if __name__ == "__main__":
    app.run(debug=True)