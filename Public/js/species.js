/*
valid genes
===========
lifespan: milliseconds: Number (default = 100)
reproduction: [% of lifespan before reproduction: Number, % chance of reproduction: Number, min neighbor for offspring: Number] (default = [30, 60, 1])


*/

class Species {
    constructor(genes = { lifespan: 100, reproduction: [30, 60, 1], }, max_deviation = 2, max_population = 50, group) {
        this.genes = genes;

        this.group = group;

        this.max_deviation = max_deviation;
        this.max_population = max_population;

        this.members = [];
        this.population = 0;

        this.colorConverter = function(c, m, y, k) {
            c = (c / 100);
            m = (m / 100);
            y = (y / 100);
            k = (k / 100);

            c = c * (1 - k) + k;
            m = m * (1 - k) + k;
            y = y * (1 - k) + k;

            let r = 1 - c;
            let g = 1 - m;
            let b = 1 - y;

            r = Math.round(255 * r);
            g = Math.round(255 * g);
            b = Math.round(255 * b);

            r = r.toString(16);
            g = g.toString(16);
            b = b.toString(16);

            if (r.length == 1) r = "0" + r;
            if (g.length == 1) g = "0" + g;
            if (b.length == 1) b = "0" + b;

            return "#" + r + g + b;
        }
    }

    start(number_of_starting_members = 3, organism) {
        let rand = {
            x: Math.floor(Math.random() * 80) * 10,
            y: Math.floor(Math.random() * 80) * 10,
        };
        let color = this.colorConverter(this.genes.lifespan % 100, this.genes.reproduction[0] % 100, this.genes.reproduction[1] % 100, this.genes.reproduction[2] % 100);

        let start = new Organism(40 * 10, 40 * 10, color, this.genes, this);
        start.start();
        this.population++;

        this.group.add(start.displayObject);

    }
    update() {
        this.members.forEach(member => member.update());

        if (this.population >= this.max_population) {
            let rand = Math.random();
            if (rand > 0 && rand <= 0.9) this.max_population++;
            else if (rand > 0.9) this.members.forEach(member => {
                if (Math.random() < 0.3) {
                    member.can_reproduce = false;
                    if (Math.random() < 0.3) member.end();
                }
            });
        }

        if (this.population < 1) this.end();

    }
    end() {
        this.members = [];

        let species_no = this.genes.lifespan.toString() + (this.genes.reproduction[0] + this.genes.reproduction[1] + this.genes.reproduction[2]).toString();

        let death_sign = Pebble.Text("Species: " + species_no + " has become extinct", "24px sans-serif");
        this.group.add(death_sign);
        stage.putCenter(death_sign);
    }
    suicide() {
        this.members.forEach(member => member.end());
    }
}

class Organism {
    constructor(x, y, color = "", DNA = {}, host = Species) {
        this.x = x;
        this.y = y;

        this.DNA = DNA;
        this.genes = {
            lifespan: this.DNA.lifespan,
            reproduction: [
                parseInt(((this.DNA.reproduction[0] / 100) * this.DNA.lifespan).toFixed()),
                this.DNA.reproduction[1] / 100,
                this.DNA.reproduction[2],
            ],
        }

        this.host = host;

        this.displayObject = Pebble.Rectangle(10, 10, color, "none", 0, this.x, this.y);
        this.displayObject.visible = true;


        this.host.members.push(this);

        this.clock = 0;
        this.triggered = false;
        this.can_reproduce = false;
        this.repro_count = 0;
        this.max_repro = this.genes.reproduction[2];
    }
    start() {
        this.can_reproduce = true;
        this.triggered = true;
        this.displayObject.layer = -1;
    }
    update() {
        if (!this.triggered) return;
        if (this.clock >= 3) this.displayObject.visible = true;

        if (this.clock >= this.genes.reproduction[0] && this.can_reproduce && this.host.population < this.host.max_population + Math.floor(Math.random() * (this.host.max_deviation - -this.host.max_deviation + 1)) + -this.host.max_deviation) {
            if (Math.random() <= (this.genes.reproduction[1])) {
                this.reproduce();
                this.repro_count++;
                if (this.repro_count >= this.max_repro) this.can_reproduce = false;
            }
        }

        if (this.clock >= this.genes.lifespan) this.end();

        this.clock++;
    }
    reproduce() {
        function crand() {
            let foo = Math.floor(Math.random() * 2);
            if (foo == 0) return -1;
            if (foo == 1) return 1;
        }

        function randomInt(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        let candidate_positions = [
            { x: this.x - 10, y: this.y - 10 }, { x: this.x, y: this.y - 10 }, { x: this.x + 10, y: this.y - 10 },
            { x: this.x - 10, y: this.y }, { x: this.x + 10, y: this.y },
            { x: this.x - 10, y: this.y + 10 }, { x: this.x, y: this.y + 10 }, { x: this.x + 10, y: this.y + 10 },
        ];

        let available_positions = Array.from(candidate_positions);
        let t_member_array = Array.from(this.host.members);
        let potential_overlap_array = [];

        let index = t_member_array.indexOf(this);
        t_member_array.splice(index, 1);

        if (t_member_array.length > 0) {
            t_member_array.forEach(member => {
                if (Math.abs(member.x - this.x) < 20 && Math.abs(member.y - this.y) < 20) potential_overlap_array.push({ x: member.x, y: member.y });
            });

            if (potential_overlap_array.length > 0) {
                potential_overlap_array.forEach(potential_overlap => {
                    available_positions.forEach(pos => {
                        if (pos.x == potential_overlap.x && pos.y == potential_overlap.y) {
                            let index = available_positions.indexOf(pos);
                            available_positions.splice(index, 1);
                        }
                    });
                });
            }
        }

        available_positions.forEach(pos => {
            if (pos.x < 0 || pos.x >= 800 || pos.y < 0 || pos.y >= 800) {
                let index = available_positions.indexOf(pos);
                available_positions.splice(index, 1);
            }
        });


        if (available_positions.length > 0) {
            let rna = this.DNA;

            if (Math.random() < 0.01) {
                rna.lifespan += randomInt(-this.host.max_deviation, this.host.max_deviation);
                if (rna.lifespan < 0) rna.lifespan = 0;
            }
            if (Math.random() < 0.01) {
                rna.reproduction[0] += randomInt(-this.host.max_deviation, this.host.max_deviation);
                if (rna.reproduction[0] < 0) rna.reproduction[0] = 0;
                if (rna.reproduction[0] > 100) rna.reproduction[0] = 100;
            }
            if (Math.random() < 0.01) {
                rna.reproduction[1] += randomInt(-this.host.max_deviation, this.host.max_deviation);
                if (rna.reproduction[1] < 0) rna.reproduction[1] = 0;
                if (rna.reproduction[1] > 100) rna.reproduction[1] = 100;
            }
            if (Math.random() < 0.01) {
                rna.reproduction[2] += randomInt(-this.host.max_deviation, this.host.max_deviation);
                if (rna.reproduction[2] < 0) rna.reproduction[2] = 0;
            }

            let rand = Math.floor(Math.random() * available_positions.length);

            let n_x = available_positions[rand].x;
            let n_y = available_positions[rand].y;

            let color = this.host.colorConverter(this.DNA.lifespan % 100, this.DNA.reproduction[0] % 100, this.DNA.reproduction[1] % 100, this.DNA.reproduction[2] % 100);

            let offspring = new Organism(n_x, n_y, color, rna, this.host);
            offspring.start();
            this.host.population++;

            this.host.group.add(offspring.displayObject);
        }

    }
    end() {
        this.clock = NaN;

        let index = this.host.members.indexOf(this);
        this.host.members.splice(index, 1);

        this.displayObject.parent.remove(this.displayObject);
        this.host.population--;
    }
}