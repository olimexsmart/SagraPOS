# TODO First Release
- [x] Load/Download DB from GUI 
- [x] Printing name and display name separate
- [x] Create tables if DB is not existent
- [x] Fix electron packaging script
- [x] Complete printing APIs
- [x] Icon (not quite, consider electron builder)
# TODO Improvements
#### Printing
- [x] Printer auto-discovery (save MAC addresses to save a custom name)
- [ ] Abstract PrintHelper and solve P3 printer layout differences
- [ ] Better info print layout
- [ ] USB Printer
- [ ] Serial Printer
#### Backend
- [ ] Settings to deactivate item sequence number printing
- [ ] Settings to deactivate PrintCategories (fallback to normal categories)
- [ ] By default PrintCategories are the same as Categories, when inserting a new entry with PrintCategories deactivated
- [ ] Setting view (and then edit) page
- [ ] Product view (and then edit) page
- [ ] Complete log of events table (with its screen accessible from settings)
- [ ] Optional order recap print in settings
- [ ] Custom view order for menu items and categories
- [ ] Custom print order for menu items and print categories
- [ ] Log also from which client the order was printed
- [ ] Setup debugger
- [ ] Image upload should resize images to a standard size
- [ ] DB upload could also migrate from previous version. Introduce DB version in setting table
- [ ] Split files, they are becoming too long
- [ ] WebSocket instead of polling for quantities update
#### Frontend
- [ ] Spinner on order confirm (with error timeout)
- [ ] Spinner on menu loading (can take a while)
- [ ] QR code with WiFi credentials
- [ ] QR code for link to remote page
- [ ] Number of clients connected 
- [ ] Dialog for cash computations
- [ ] Better spacing in tablet view (kinda too crammed)
- [ ] Remember order selection when changing screen
- [ ] Confirm OK/NOK snackbar when performing operations (like order)
- [ ] Info table limit max width on large screens
- [ ] Toggle to see all items in a unique list
- [x] Light/Dark theme
- [x] Bump Angular version
- [ ] Refactor to use latest guidelines (standalone components)
- [ ] favicon
- [ ] Mono font in order component similar to printing font and loaded locally 
- [ ] Confetti on order confirm
- [ ] Use pipe for currency
- [ ] Insert cash amount and compute remainder on total
- [ ] Main page sidenav to declutter toolbar icons
#### General
- [x] Build pipeline + release on commit tag
- [x] Test Linux packaging
- [x] Test macOS packaging
- [ ] License file
- [ ] Should not be able to launch another instance (check for port 3000 in use)
- [x] Package script should also do `npm install` on the three folders
- [ ] Managed monorepo with nx, lerna, npm workspaces
# Bugs
- [x] Error in printing 'é' (e.g. caffé)
- [ ] Log entries should carry prices along, because prices could change in time
- [ ] Setting an inventory value to null does not hide badge (caused by CSS)
- [ ] macOS buggy little icon
- [ ] Broken inventory badges after Angular version bump, refactor using chip inside card
- [x] Refresh does not works on clients (`/main` not found)
