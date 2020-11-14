# Voxel boat

![Animazione barca](VoxelBoat.gif)

## Idea e obiettivi
Creare un'animazione di una barca a remi su mare entrambi in movimento.
Mostrare con la telecamera una panoramica della scena.
Tra gli obiettivi principali riportiamo:
+ creare un mare abbastanza grande mantenendo i 60fps;
+ modellare una barca articolata e interessante;
+ simulare il moto ondoso del mare ed il muoversi dei remi;
+ utilizzare texture per definire meglio i componenti della barca;
+ toccare tutti gli argomenti visti a lezione.

## Struttura del progetto
Il progetto può essere lanciato aprendo il file *index.html*.
I file che compongono il progetto sono:
+ *voxelWorld.js*, contiene una classe, ispirata a questo [tutorial](https://threejsfundamentals.org/threejs/lessons/threejs-voxel-geometry.html), che permette di ottimizzare il numero di facce condivise tra voxel adiacenti;
+ *boat.js*, contiene il codice che genera la mesh per la barca e per i remi e i rispettivi movimenti;
+ *sea.js*, contiene il codice che genera la mesh per il mare e la sua animazione;
+ *index.html*, vengono utilizzate le mesh generate precedentemente e impostato il movimento della telecamera;
+ *textures/our_textures.png*, contiene le texture usate nel progetto.

## Processo di sviluppo
In un primo momento ci siamo concentrati sulla creazione del modello della barca, usando la classe voxelWorld risparmiando sulla generazione delle facce all'interno della barca. Poi abbiamo sviluppato una versione non ottimizzata del mare di dimensione massima 64x64. Successivamente abbiamo fatto qualche prova con telecamera e texture fino a trovare un risultato soddisfacente.
In ultimo, abbiamo ottimizzato il mare calcolando il suo movimento all'interno del vertex shader e abbiamo aggiunto l'avanzamento della barca.

## Problematiche
Il problema principale è stato quello di rendere l'applicazione GPU-bound piuttosto che CPU-bound, spostando quindi il lavoro computazionale all'interno degli shader. Abbiamo avuto problematiche minori riguardo al movimento coerente dei remi, dato che volevamo usare la stessa mesh per entrambe le file dei remi.
