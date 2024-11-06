
let eventBus = new Vue();

Vue.component('task', {})


Vue.component('column', {
    props: {
        column_id: {
            type: String,
            required: true,
        }
    },
    template: `
        <p>Column - {{ column_id }}</p>
    `,
})



let app = new Vue({
    el: '#app',

})