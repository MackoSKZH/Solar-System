document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('simulationCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 10000;
    canvas.height = 10000;

    const AU = 149.6e6 * 1000;
    const G = 6.67428e-11;
    const SCALE = 130 / AU;
    const TIMESTEP = 3600*24;

    class Planet {
        constructor(x, y, radius, color, mass) {
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.color = color;
            this.mass = mass;

            this.orbit = [];
            this.sun = false;
            this.distanceToSun = 0;

            this.xVel = 0;
            this.yVel = 0;
        }

        draw(ctx) {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x * SCALE + canvas.width / 2, this.y * SCALE + canvas.height / 2, this.radius, 0, Math.PI * 2, false);
            ctx.fill();

            if (!this.sun) {
                ctx.beginPath();
                ctx.moveTo(this.orbit[0].x * SCALE + canvas.width / 2, this.orbit[0].y * SCALE + canvas.height / 2);
                for (const point of this.orbit) {
                    ctx.lineTo(point.x * SCALE + canvas.width / 2, point.y * SCALE + canvas.height / 2);
                }
                ctx.strokeStyle = this.color;
                ctx.stroke();
            }
        }

        attract(other) {
            const dx = other.x - this.x;
            const dy = other.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (other.sun) {
                this.distanceToSun = distance;
            }

            const force = G * this.mass * other.mass / (distance * distance);
            const theta = Math.atan2(dy, dx);
            const forceX = Math.cos(theta) * force;
            const forceY = Math.sin(theta) * force;

            return {forceX, forceY};
        }

        updatePosition(planets) {
            let totalForceX = 0;
            let totalForceY = 0;

            for (const planet of planets) {
                if (this === planet) continue;

                const {forceX, forceY} = this.attract(planet);
                totalForceX += forceX;
                totalForceY += forceY;
            }

            this.xVel += totalForceX / this.mass * TIMESTEP;
            this.yVel += totalForceY / this.mass * TIMESTEP;

            this.x += this.xVel * TIMESTEP;
            this.y += this.yVel * TIMESTEP;
            this.orbit.push({x: this.x, y: this.y});

            if (this.orbit.length > 500) {
                this.orbit.shift();
            }
        }
    }

    const sun = new Planet(0, 0, 30, 'yellow', 1.98892 * 10**30);
    sun.sun = true;

    const mercury = new Planet(0.387 * AU, 0, 8, 'darkgrey', 3.30 * 10**23);
    mercury.yVel = -47.4 * 1000;

    const venus = new Planet(0.723 * AU, 0, 14, 'white', 4.8685 * 10**24);
    venus.yVel = -35.02 * 1000;

    const earth = new Planet(-1 * AU, 0, 16, 'blue', 5.9742 * 10**24);
    earth.yVel = 29.783 * 1000;

    const mars = new Planet(-1.524 * AU, 0, 12, 'red', 6.39 * 10**23);
    mars.yVel = 24.077 * 1000;

    const jupiter = new Planet(-5.2 * AU, 0, 28, 'brown', 1.898 * 10**27);
    jupiter.yVel = 13.07 * 1000;

    const saturn = new Planet(-9.58 * AU, 0, 24, 'yellow', 5.68 * 10**26);
    saturn.yVel = 9.69 * 1000;

    const uranus = new Planet(19.2 * AU, 0, 20, 'lightblue', 8.68 * 10**25);
    uranus.yVel = -6.81 * 1000;

    const neptune = new Planet(30.05 * AU, 0, 20, 'darkblue', 1.02 * 10**26);
    neptune.yVel = -5.43 * 1000;

    const planets = [sun, mercury, venus, earth, mars, jupiter, saturn, uranus, neptune];

    let sunExists = true;

    canvas.addEventListener('click', function(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const sun = planets[0];
        const distance = Math.sqrt((x - (sun.x * SCALE + canvas.width / 2)) ** 2 + (y - (sun.y * SCALE + canvas.height / 2)) ** 2);

        if (distance < sun.radius && sunExists) {
            sunExists = false;
        }
    });

    function main() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (sunExists) {
            planets[0].draw(ctx);
        }

        for (let i = 1; i < planets.length; i++) {
            const planet = planets[i];
            if (sunExists) {
                planet.updatePosition(planets);
            } else {
                planet.updatePosition(planets.slice(1));
            }
            planet.draw(ctx);
        }

        requestAnimationFrame(main);
    }

    main();
});