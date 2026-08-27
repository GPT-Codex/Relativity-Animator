# Relative Motion Animator

An interactive educational tool for visualising and solving Class XI / JEE style relative motion and kinematics problems in 2D.

## Quick Start

### Prerequisites
- Python 3.8+
- Flask (`pip install -r requirements.txt`)

### Running the Application

Start the Flask server:

```bash
python3 app.py
```

By default, the server will start at `http://localhost:8000`.

To specify custom host and port configuration:

```bash
HOST=0.0.0.0 PORT=8000 python3 app.py
```

### Running Tests

To run the automated physics unit test suite:

```bash
node tests/physics.test.js
```

## Features

- **2D Kinematics & Analytical Physics**: Calculates trajectories, relative positions, relative velocities, and relative accelerations analytically ($r(t) = r_0 + v_0 t + \frac{1}{2} a t^2$).
- **Signature Feature — "Make Relative Motion Obvious"**: One-click transformation into reference frame of Particle A to collapse parabolic motion into straight-line relative vectors.
- **Closest Approach & Collision Detection**: Calculates analytical minimum separation distance $d_{\text{min}}$ and time of closest approach $t_{\text{min}}$.
- **Custom Presets**: Create, save, load, delete, and import/export JSON custom simulation presets saved in LocalStorage.
- **Interactive Graphs**: Synchronized plots of separation distance, positions, and velocities vs time with scrubber cursor.
