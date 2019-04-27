from flask import (
    Flask,
    jsonify
)
from skyfield.api import load
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
@app.route('/')
def mars():
    planets = load('de421.bsp')
    earth, mars = planets['earth'], planets['mars']
    ts = load.timescale()
    t = ts.now()
    astrometric = mars.at(t).observe(earth)
    ra, dec, distance = astrometric.radec()

    return jsonify({"Distance": distance.km,
                    "Angle": dec.degrees,
                    "Position": dec.dstr(places=1, warn=True)})


if __name__ == '__main__':
    app.run(debug=True)
