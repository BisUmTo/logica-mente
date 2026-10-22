# Logica Mente

Gioco didattico per tradurre frasi in espressioni booleane. Seleziona le proposizioni, assegna le lettere, costruisci una regola e mettila alla prova.

- 20 livelli guidati, poi incarichi procedurali.
- AND, OR e NOT in quattro notazioni a scelta.
- Proposizione risultato facoltativa: se selezionata, compare davanti alla formula (per esempio M = C & B).
- Collaudo con albero ingrandibile, passaggi scritti o macchina.
- Tre vite, indizi, suoni disattivabili e progressi locali.
- Report JSON scaricabile con tentativi, tempo attivo stimato e confronto delle soluzioni per il docente.

## Utilizzo

Sito statico senza build o backend. Per provarlo in locale: `python3 -m http.server 8770`, poi apri http://localhost:8770. Per GitHub Pages scegli il branch main e la cartella radice. Gli asset e i font sono inclusi e gli URL sono relativi.

## Dati

Il gioco salva i progressi solo nel browser. Nome/codice e classe sono facoltativi; il report viene condiviso solo se lo invii tu. Il report non è autenticato e il tempo attivo è una stima, non una misura esatta dello studio. I suggerimenti di semplificazione non assegnano voti e non garantiscono la formula più breve possibile. Sono conservati gli ultimi 2000 eventi e i totali di progresso.

## Crediti

Illustrazioni originali generate per il progetto, suoni originali sintetizzati con Web Audio. Icone [Phosphor](https://github.com/phosphor-icons/core), licenza MIT in assets/icons/LICENSE.txt. Font [Fraunces](https://github.com/undercasetype/Fraunces) e [Barlow Condensed](https://github.com/jpt/barlow), licenze SIL OFL in assets/fonts/. Contesti e regole sono semplificati a scopo didattico.
