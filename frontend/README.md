# TODO First Release
- [ ] Load/Download DB from GUI
- [ ] Printing name and display name separate
- [ ] Create tables if not existent
- [ ] Fix electron packaging script
- [x] Complete printing APIs
- [ ] Follow as much TODOs in code as possible
# TODO Improvements
#### Printing
- [ ] Printer auto-discovery (save MAC addresses to save a custom name)
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
#### Frontend
- [ ] Spinner on order confirm (with error timeout)
- [ ] QR code with WiFi credentials
- [ ] QR code for link to remote page
- [ ] Number of clients connected on master screen
- [ ] Dialog for cash computations
- [ ] Better spacing in tablet view (kinda too crammed)
- [ ] Remember order selection when changing screen
- [ ] Confirm OK/NOK snackbar when performing operations (like order)
- [ ] Info table max width on large screens
- [ ] Toggle to see all items in a unique list
- [ ] Customizable color palette of interface (local to client)
- [ ] Bump Angular version
#### Deployment
- [ ] Documentation integrated with GitHub wiki and hosted pages (docusaurus?)
- [ ] Build pipeline + release on commit tag
- [ ] Test Linux packaging
- [ ] Test macOS packaging
- [ ] License file
# Bugs
- [x] Error in printing 'é' (e.g. caffé)
- [ ] Log entries should carry prices along, because prices could change in time
- [ ] Setting an inventory value to null does not hide badge (caused by CSS)
