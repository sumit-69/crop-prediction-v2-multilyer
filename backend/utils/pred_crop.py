"""
Crop prediction using pure NumPy — no PyTorch required.
Weights are read directly from the PyTorch zip format.
"""
import os
import zipfile
import numpy as np

BASE = os.path.dirname(os.path.dirname(__file__))

CLASSES = [
    'apple', 'banana', 'blackgram', 'chickpea', 'coconut', 'coffee',
    'cotton', 'grapes', 'jute', 'kidneybeans', 'lentil', 'maize',
    'mango', 'mothbeans', 'mungbean', 'muskmelon', 'orange', 'papaya',
    'pigeonpeas', 'pomegranate', 'rice', 'watermelon'
]

_weights = None


def _load_weights():
    global _weights
    if _weights is not None:
        return _weights

    hdf5_path = os.path.join(BASE, 'model', 'baseline', 'baseline.hdf5')
    norm_path  = os.path.join(BASE, 'model', 'normalization', 'normalization.npz')

    # Layer order: fc1.weight, fc1.bias, fc2.weight, fc2.bias,
    #              fc3.weight, fc3.bias, fc4.weight, fc4.bias
    shapes = [(64,7), (64,), (128,64), (128,), (64,128), (64,), (22,64), (22,)]
    layers = []
    with zipfile.ZipFile(hdf5_path) as z:
        for i, shape in enumerate(shapes):
            raw = z.read(f'model/data/{i}')
            layers.append(np.frombuffer(raw, dtype=np.float32).reshape(shape).copy())

    norm = np.load(norm_path)
    _weights = {
        'fc1_w': layers[0], 'fc1_b': layers[1],
        'fc2_w': layers[2], 'fc2_b': layers[3],
        'fc3_w': layers[4], 'fc3_b': layers[5],
        'fc4_w': layers[6], 'fc4_b': layers[7],
        'mean':  norm['mean'].astype(np.float32),
        'std':   norm['std'].astype(np.float32),
    }
    return _weights


def _selu(x):
    alpha = 1.6732632423543772
    scale = 1.0507009873554805
    return scale * np.where(x > 0, x, alpha * (np.exp(x) - 1))


def _softmax(x):
    e = np.exp(x - x.max())
    return e / e.sum()


def _forward(nitrogen, phosphorous, potassium, temperature, humidity, ph, rainfall):
    w = _load_weights()
    x = np.array([nitrogen, phosphorous, potassium, temperature, humidity, ph, float(rainfall)],
                 dtype=np.float32)
    x = (x - w['mean']) / w['std']
    x = _selu(w['fc1_w'] @ x + w['fc1_b'])
    x = _selu(w['fc2_w'] @ x + w['fc2_b'])
    x = _selu(w['fc3_w'] @ x + w['fc3_b'])
    x =       w['fc4_w'] @ x + w['fc4_b']
    return _softmax(x)


def predict_crop(nitrogen, phosphorous, potassium, temperature, humidity, ph, rainfall):
    probs = _forward(nitrogen, phosphorous, potassium, temperature, humidity, ph, rainfall)
    return CLASSES[int(probs.argmax())]


def predict_top3(nitrogen, phosphorous, potassium, temperature, humidity, ph, rainfall):
    probs = _forward(nitrogen, phosphorous, potassium, temperature, humidity, ph, rainfall)
    top3_idx = probs.argsort()[-3:][::-1]
    return [
        {"crop": CLASSES[int(i)], "confidence": round(float(probs[i]) * 100, 1)}
        for i in top3_idx
    ]
