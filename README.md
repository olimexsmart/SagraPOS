### Make electron app
1. Delete `electron/src/dist`
2. Change working directory to `frontend`
3. Build frontend 
4. Change working directory to `backend`
5. Build backend
6. Copy frontend `browser` build folder in `backend/dist`
7. Copy `backend/dist` folder in `electron/src`
8. Change working directory to `electron`
9. Build electron (or run depending on input argument)

### Run rev servers
1. Launch backend with nodemon
2. Launch frontend with angular CLI (concurrently)
