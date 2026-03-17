import Odoo from "odoo-xmlrpc";

var odoo = (data) => new Odoo({
    url: 'http://202.6.234.117:8069',
    db: 'odoo-vitraining-live_trial',
    username: data.username,
    password: data.password

});

export default odoo;