let space = Pebble.Keyboard(32, document.body);

world.addNewScene(
	function (world, scene, group) {
		scene.species = new S pecies({ lifespan: 100, reproduction: [30, 60, 3], }, 1, 50, group);

		scene.species.start(3, () => { return new Organism(20, 20, scene.species.color, scene.species.genes, scene.species) });

		scene.population_counter = Pebble.Text("Population: 0", "18px sans-serif");
		stage.putLeft(scene.population_counter, 140, -365);

		scene.gene_counter = Pebble.Text(JSON.stringify(scene.species.DNA), "11px sans-serif");
		group.putTop(scene.gene_counter, -365, 15);


		scene.pause = false;

		space.release = () => scene.pause = !scene.pause;

		group.add(scene.species, scene.population_counter, scene.gene_counter);

		scene.population_counter.layer = 1000;
		scene.gene_counter.layer = 1000;

	},
	function (world, scene, group) {
		if (scene.pause == false) {
			scene.species.update();
			scene.population_counter.content = "Population: " + scene.species.population;
			if (scene.species.population > 0) {
				let acc_dna = scene.species.members;
				let acc_ls = 0;
				let acc_re0 = 0;
				let acc_re1 = 0;
				let acc_re2 = 0;

				acc_dna.forEach(member => {
					acc_ls += member.DNA.lifespan;
					acc_re0 += member.DNA.reproduction[0];
					acc_re1 += member.DNA.reproduction[1];
					acc_re2 += member.DNA.reproduction[2];
				});

				acc_ls /= scene.species.population;
				acc_re0 /= scene.species.population;
				acc_re1 /= scene.species.population;
				acc_re2 /= scene.species.population;

				scene.gene_counter.content = `lifespan: ${Math.round(acc_ls)},\n amount of lifespan before being able to reproduce: ${Math.round(acc_re0)}\%, Chance of reproduction per tick: ${Math.round(acc_re1)}\%, Max amount of offspring per organism: ${Math.round(acc_re2)}`
			}
		}
	},
);