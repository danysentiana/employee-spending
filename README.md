# node-web
web admin develop with nodejs

# prerequisites
1. nodejs version >= 20.15.0
2. mysql version >= 8
3. npm version >= 10.7.0
   
# install
1. clone this repo to your local
2. run ``npm install``
3. create ``.env`` file to setup database connection
4. run ``node .\bin\node-web``
5. access url localhost:<your_port>

# env
APP_PORT={PORT}
APP_ADDRESS=0.0.0.0

DB_HOST={HOST}
DB_USER={USER}
DB_PASS={PASS}
DB_NAME={NAME}
DB_POOL=20
DB_PORT=3306

JWT_SECRET="$2a$10$8JH91ED/iO7OqG2nPCh38Ov51XRArxZZSxd6MB9seyG0Nd5JYEWTm"
JWT_EXPIRED=28800000
