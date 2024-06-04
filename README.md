# TODO First Release
- [x] Load/Download DB from GUI 
- [x] Printing name and display name separate
- [x] Create tables if DB is not existent
- [x] Fix electron packaging script
- [x] Complete printing APIs
- [x] Icon (not quite, consider electron builder)
# TODO
#### Printing
- [x] Printer auto-discovery (save MAC addresses to save a custom name)
- [x] Abstract PrintHelper and solve P3 printer layout differences
- [x] Better info print layout
- [x] USB Printer
- [x] Serial Printer
- [ ] Printing categories should have a printing order column
- [ ] Print menu items always in the same order (name?)
#### Backend
- [x] Settings to deactivate item sequence number printing
- [x] API to copy PrintCategories from Categories, if needed to be the same
- [x] Setting view (and then edit) page
- [x] Product view (and then edit) page
- [x] Complete log of events table (with its screen accessible from settings)
- [x] Optional order recap print in settings
- [x] Custom view order for menu items and categories
- [x] Custom print order for print categories
- [x] Log also from which printer the order was printed
- [ ] Setup debugger
- [ ] Image upload should resize images to a standard size
- [x] DB upload could also migrate from previous version. Introduce DB version in setting table
- [ ] Split files, they are becoming too long
- [x] WebSocket instead of polling for quantities update MARCO
- [ ] Ensure that a printer disconnection DOES NOT log the order as succesful
- [ ] Default image if null on menu item
- [ ] Scaricare info come CSV
#### Frontend
- [x] Spinner on order confirm (with error timeout)
- [ ] Spinner on menu loading (can take a while)
- [x] Spinner on application launch (instead of "Loading...")
- [x] QR code with WiFi credentials
- [x] QR code for link to remote page
- [x] Number of clients connected MARCO
- [ ] Better spacing in tablet view (kinda too crammed)
- [ ] Remember order selection when changing screen
- [ ] Confirm OK/NOK snackbar when performing operations (like order)
- [ ] Info table limit max width on large screens
- [ ] Toggle to see all items in a unique list
- [x] Light/Dark theme
- [x] Bump Angular version
- [x] Refactor to use latest guidelines (standalone components)
- [ ] favicon
- [x] Mono font in order component similar to printing font and loaded locally 
- [ ] Confetti on order confirm
- [x] Use pipe for currency
- [x] Insert cash amount and compute remainder on total
- [x] Main page sidenav to declutter toolbar icons
- [x] Update to Angular v18
- [ ] Sortable info table
- [ ] Limit Info Table width on a wide screen
- [ ] Order index for menu items visualization
#### General
- [x] Build pipeline + release on commit tag
- [x] Test Linux packaging
- [x] Test macOS packaging
- [ ] License file
- [x] Should not be able to launch another instance (check for port 3000 in use) MARCO
- [x] Package script should also do `npm install` on the three folders
- [ ] Managed monorepo with nx, lerna, npm workspaces
- [ ] Button to programmatically open dev tools from electron build
# Bugs
- [x] Error in printing 'é' (e.g. caffé)
- [x] Log entries should carry prices along, because prices could change in time
- [x] Setting an inventory value to null does not hide badge (caused by CSS)
- [ ] macOS buggy little icon
- [x] Broken inventory badges after Angular version bump, refactor using chip inside card
- [x] Refresh does not works on clients (`/main` not found)
- [x] Recap ordine non usa il printing name
- [x] Failed print should not log (printer disconnected)
- [ ] Order view does not group by print categories
- [ ] Long orders print button convers total (ask Marco)

