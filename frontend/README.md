# TODO
- [ ] Toggle tra vista tutto in una schermata e divisa per categoria
- [x] Counter del numero di vendite del piatto stampato sul biglietto 
- [ ] QR code per connessione a wifi
- [ ] QR code per link pagina
- [x] Preparare DB per castagnata
- [ ] Spinner on order confirm (with error timeout)
- [ ] Load/Download DB from GUI
- [ ] Printing name and display name separate
- [ ] Settings to deactivate sequence printing
- [ ] Settings to deactivate PrintCategories (fallback to normal categories)
- [ ] By default PrintCategories are the same as Categories, when inserting a new entry with PrintCategories deactivated
- [ ] Create tables if not existent
- [ ] Printer auto-discovery (save MAC addresses to save a custom name)
# OLD TODO
- [ ] Error in printing 'é' (e.g. caffé)
- [ ] Print connection info at startup (with QR codes) (and from settings)
- [ ] Swap DB API
- [ ] Dialog for cash computations
- [ ] Better spacing in tablet view (kinda too crammed)
- [ ] Setting view (and then edit) page
- [ ] Product view (and then edit) page
- [ ] Document here build and deploy procedure (detailed)
- [ ] Setting an inventory value to null does not hide badge (caused by CSS)
- [ ] Remember order selection when changing screen
- [ ] Confirm OK/NOK snackbar when performing operations (like order)
- [ ] Complete log of events table (with its screen accessible from settings)
- [ ] Info table max width on large screens
- [ ] Periodic refresh with requestAnimationFrame
- [ ] Toggle to see all items in a unique list
- [ ] Settings to order with different logic items list (decided by the user)
- [ ] Log entries should carry prices along, because prices could change in time
- [ ] Custom order also for categories
- [ ] Cut categories separate by item categories
- [ ] Log also on which device the order was printed
- [ ] Optional recap print in settings
- [ ] Better recap layout
- [ ] Abstract PrintHelper and solve P3 printer layout differences
# Idee
* Fare un esercizio di deploy, quindi avere un'opzione docker, un exe tutto in un singolo file, provare a fare girare su windows e su macOS
	* [ ] Fondamentale avere un bundle il più possibile compatto, idealmente un singolo file
* Collegamento a stampante con USB, magari anche seriale giusto perché facile
* Sito web con tutorial di installazione dettagliato
* Palette colori personalizzabile, opzionalmente legato alla cassa selezionata
* ~~Da un punto di vista di semplicità la cosa più immediata sarebbe semplicemente lanciare un'applicazione che combina backend e frontend. L'ideale sarebbe Electron:
* Applicazione console pura C#, con una interfaccia da terminale user-friendly, non il dump del log
	* [x] Lanciare il backend ASP .NET Core su un process/thread separato
	* [ ] L'applicazione da terminale potrebbe addirittura fare richieste alle API in loopback

# Timeline
### 2023-11-11
* Cleared console from logger output, while still being able to revert to default using an argument parameter
* Introduced thread to print on Console something nice (just a big ASCII art for now)
	* [ ] Test periodic call of API (or some smart intra-thread communication) to display some data of what is happening
* Tested OK build for Windows and macOS
	* [ ] It is a lot of files but probably it is inevitable. Probably it would be great to look how installers work and copy everything to the Program Files folders as one would expect
### 2023-10-27
* Added "number of orders containing this item" to receipt print. Useful to help have a line.
* Configured DB for "Castagnata" event
* Deploy to both main and backup system