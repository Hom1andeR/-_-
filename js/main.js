
let eventBus = new Vue();

Vue.component('creator', {
    template:
        `
        <div class="aboba-overlay">
            <div class="aboba-content"></div>
                <div class="creator">
                    <div v-if="errors.length" v-for="el in errors">
                        <p class="red_text">Ошибка: {{ el }} !</p>
                    </div>
                    <p><b>Название</b></p>
                    <input type="text" v-model="blank.title">
                    <p>Описание</p>
                    <textarea col="12" rows="4" v-model="blank.description"></textarea><br>
                    <p>Когда сделать</p>
                    <input type="date" v-model="blank.deadline"><br>
                    <button class="btn_style" @click.prevent="submitCreateForm">Добавить</button>
                    <button class="btn_style" @click.prevent="cancelCreateForm">Отмена</button>
                </div>
             </div>
        </div>
    `,
    data(){
        return{
            errors: [],
            blank:{
                date:{
                    year: new Date().getFullYear(),
                    month: (new Date().getMonth()) + 1,
                    day: new Date().getDate(),
                    hour: new Date().getHours(),
                    min: new Date().getMinutes(),
                },
                reasonRefund: null,

                title: null,
                description: null,
                deadline:null,
                dateOfRed:{
                    year: null,
                    month: null,
                    day: null,
                    hour: null,
                    min: null,
                },
                overdueFlag: false,
            }
        }
    },
    methods:{
        submitCreateForm(){
            this.errors= [];

            if (!this.blank.title) {
                this.errors.push('Заголовок обязателен');
            }
            if (!this.blank.description) {
                this.errors.push('Описание обязательно');
            }
            if (!this.blank.deadline) {
                this.errors.push('Срок сдачи обязателен');
            } else {
                const today = new Date();
                const deadlineDate = new Date(this.blank.deadline);

                if (deadlineDate < today) {
                    this.errors.push('Дедлайн не может быть раньше сегодняшнего дня');
                }
            }

            if(!this.blank.title){
                this.errors.push('Заголовок обязателен');
            }
            if(!this.blank.description){
                this.errors.push('Описание обязательно');
            }
            if(!this.blank.deadline){
                this.errors.push('Срок сдачи обязателен');
            }
            if(!this.errors.length){
                let copy = this.copyCard();
                eventBus.$emit('take-new-card', copy);
            }

        },
        cancelCreateForm(){
            eventBus.$emit('cancel-create-card');
        },
        copyCard(){
            let copy= Object.assign({}, this.blank);
            copy.date= Object.assign({}, this.blank.date);
            copy.dateOfRed= Object.assign({}, this.blank.dateOfRed);
            return copy;
        }
    },
    mounted(){

    }
})

Vue.component('card', {
    props: {
        column_id: {
            type: String,
            required: true,
        },
        indexInList: {
            type: Number,
            required: true,
        },
        exampleCard: {
            type: Object,
            required: true,
        }
    },
    data() {
        return {
            errorRefund: null,
            cardRedactionFlag: false,
            showReasonRefundFlag: false,
            blankForRedaction: {
                dateOfRed: {
                    year: new Date().getFullYear(),
                    month: new Date().getMonth(),
                    day: new Date().getDate(),
                    hour: new Date().getHours(),
                    min: new Date().getMinutes(),
                },
                title: null,
                description: null,
                deadline: null,
            }
        };
    },
    template: `
<div :class="{'card-space' : !exampleCard.overdueFlag, 'red-card-space' : exampleCard.overdueFlag}">
<p><b>Название: {{exampleCard.title}}</b></p>
<input type="text" v-if="cardRedactionFlag" v-model="blankForRedaction.title">

<p><b>Описание:</b>
{{exampleCard.description}}</p>
<textarea col="24" rows="4" v-if="cardRedactionFlag" v-model="blankForRedaction.description"></textarea>

<div v-show="exampleCard.date.day"><b>Задание создано :</b>
<span>{{exampleCard.date.day}}.</span>
<span>{{exampleCard.date.month}}.</span>
<span>{{exampleCard.date.year}}</span>
&nbsp
<span>{{exampleCard.date.hour}}:</span>
<span>{{exampleCard.date.min}}</span>
</div>

<div v-show="exampleCard.dateOfRed.day"><b>Задание редактировано :</b>
<span>{{exampleCard.dateOfRed.day}}.</span>
<span>{{exampleCard.dateOfRed.month}}.</span>
<span>{{exampleCard.dateOfRed.year}}</span>
&nbsp
<span>{{exampleCard.dateOfRed.hour}}:</span>
<span>{{exampleCard.dateOfRed.min}}</span>
</div>

<p v-show="cardRedactionFlag"><b>Поменять дэдлайн :</b><input type="date" v-model="blankForRedaction.deadline"> </p>

<p><b>Сделать до:</b> {{exampleCard.deadline}}</p>

<p class="green_text" v-if="exampleCard.reasonsRefund && exampleCard.reasonsRefund.length > 0">
<b>Нужно было доработать:</b>
<ul class="unmark">
<li v-for="reason in exampleCard.reasonsRefund">{{ reason }}</li>
</ul>
</p>

<button class="btn_style" v-show="column_id=='first' && !cardRedactionFlag" @click.prevent="deleteCard(indexInList)">Удалить</button>
<button class="btn_style" v-show="(column_id=='first' || column_id=='second') && !cardRedactionFlag" @click.prevent="cardRedactionFlag= true">Редактировать</button>
<button class="btn_style" v-show="cardRedactionFlag" @click.prevent="cancelRedaction">Отмена</button>
<button class="btn_style" v-show="cardRedactionFlag" @click.prevent="submitRedForm">Сохранить</button>
<button class="move_btn btn_style" v-show="column_id=='first' && !cardRedactionFlag" @click.prevent="moveCardToSecond"> » </button>
<button class="move_btn btn_style" v-show="column_id=='second' && !cardRedactionFlag" @click.prevent="moveCardToThird"> » </button>

<button class="move_btn btn_style" v-show="column_id=='third' && !showReasonRefundFlag" @click.prevent="showReasonRefundFlag= true"> « </button>
<p v-if="showReasonRefundFlag"><b>Причина возврата:</b>
<span v-if="showReasonRefundFlag && errorRefund != null" class="red_text"> {{ errorRefund }} </span>
<input v-if="showReasonRefundFlag" type="text" v-model="exampleCard.reasonRefund">
</p>
<button class="move_btn btn_style" v-show="column_id=='third' && showReasonRefundFlag" @click.prevent="cancelRemoving">Отмена</button>
<button class="move_btn btn_style" v-show="column_id=='third' && showReasonRefundFlag" @click.prevent="moveCardToSecondFromThird">Вернуть</button>

<button class="move_btn btn_style" v-show="column_id=='third' && !cardRedactionFlag" @click.prevent="moveCardToFourth"> » </button>
</div>
`,
    methods: {
        submitRedForm() {
            if (this
                .blankForRedaction.title) {
                this.exampleCard.title = this.blankForRedaction.title;
            }
            if (this.blankForRedaction.description) {
                this.exampleCard.description = this.blankForRedaction.description;
            }
            if (this.blankForRedaction.deadline) {
                this.exampleCard.deadline = this.blankForRedaction.deadline;
            }
            if (this.blankForRedaction.title || this.blankForRedaction.description || this.blankForRedaction.deadline) {
                this.exampleCard.dateOfRed.year = this.blankForRedaction.dateOfRed.year;
                this.exampleCard.dateOfRed.month = this.blankForRedaction.dateOfRed.month;
                this.exampleCard.dateOfRed.day = this.blankForRedaction.dateOfRed.day;
                this.exampleCard.dateOfRed.hour = this.blankForRedaction.dateOfRed.hour;
                this.exampleCard.dateOfRed.min = this.blankForRedaction.dateOfRed.min;
            }

            this.blankForRedaction.title = null;
            this.blankForRedaction.description = null;
            this.blankForRedaction.deadline = null;
            this.cardRedactionFlag = false;
        },
        cancelRedaction() {
            this.blankForRedaction.title = null;
            this.blankForRedaction.description = null;
            this.blankForRedaction.deadline = null;
            this.cardRedactionFlag = false;
        },
        moveCardToSecond() {
            let copy = this.copyCard();
            eventBus.$emit('move-card-to-second', copy);
            eventBus.$emit('delete-from-first', this.indexInList);
        },
        moveCardToThird() {
            let copy = this.copyCard();
            eventBus.$emit('move-card-to-third', copy);
            eventBus.$emit('delete-from-second', this.indexInList);
        },
        moveCardToSecondFromThird() {
            this.errorRefund = null;
            if (!this.exampleCard.reasonRefund) {
                this.errorRefund = "Нужно указать причину возврата";
            } else {
// Инициализируем reasonsRefund, если оно отсутствует
                if (!this.exampleCard.reasonsRefund) {
                    this.exampleCard.reasonsRefund = [];
                }
// Добавляем причину возврата в массив
                this.exampleCard.reasonsRefund.push(this.exampleCard.reasonRefund);

// Очищаем поле причины для нового ввода
                this.exampleCard.reasonRefund = null;

                let copy = this.copyCard();
                eventBus.$emit('move-card-to-second', copy);
                eventBus.$emit('delete-from-third', this.indexInList);
            }
        },
        moveCardToFourth() {
            let copy = this.copyCard();
            eventBus.$emit('move-card-to-fourth', copy);
            eventBus.$emit('delete-from-third', this.indexInList);
        },
        cancelRemoving() {
            this.showReasonRefundFlag = false;
        },
        deleteCard(index) {
            eventBus.$emit('delete-from-first', index);
        },
        copyCard() {
            let copy = Object.assign({}, this.exampleCard);
            copy.date = Object.assign({}, this.exampleCard.date);
            copy.dateOfRed = Object.assign({}, this.exampleCard.dateOfRed);
            return copy;
        }
    }
});


Vue.component('column', {
    props: {
        column_id: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        }
    },
    data() {
        return {
            list: [],
            showFormFlag: false,
        };
    },
    template: `
<div class="column-space">
<p>{{ name }}</p>
<creator v-if="column_id=='first' && showFormFlag"></creator>
<div class="align-center" v-show="list" v-for="(card, index) in list" :key="index">
<card :column_id="column_id" :exampleCard="card" :indexInList="index"></card>
</div>
</div>
`,
    methods: {
        saveList() {
            localStorage.setItem(`cards-${this.column_id}`, JSON.stringify(this.list));
        },
        loadList() {
            const savedList = localStorage.getItem(`cards-${this.column_id}`);
            if (savedList) {
                this.list = JSON.parse(savedList);
            }
        }
    },
    mounted() {
        this.loadList();

        eventBus.$on('need-create-card', () => {
            if (this.column_id == 'first') {
                this.showFormFlag = true;
            }
        });

        eventBus.$on('cancel-create-card', () => {
            if (this.column_id == 'first') {
                this.showFormFlag = false;
            }
        });

        eventBus.$on('take-new-card', (copy) => {
            if (this.column_id == 'first') {
                this.list.push(copy);
                this.showFormFlag = false;
                this.saveList();
            }
        });

        eventBus.$on('delete-from-first', (index) => {
            if (this.column_id == 'first') {
                this.list.splice(index, 1);
                this.saveList();
            }
        });

        eventBus.$on('move-card-to-second', (copy) => {
            if (this.column_id == 'second') {
                this.list.push(copy);
                this.saveList();
            }
        });

        eventBus.$on('move-card-to-third', (copy) => {
            if (this.column_id == 'third') {
                this.list.push(copy);
                this.saveList();
            }
        });

        eventBus.$on('delete-from-second', (index) => {
            if (this.column_id == 'second') {
                this.list.splice(index, 1);
                this.saveList();
            }
        });

        eventBus.$on('delete-from-third', (index) => {
            if (this.column_id == 'third') {
                this.list.splice(index, 1);
                this.saveList();
            }
        });

        eventBus.$on('move-card-to-fourth', (copy) => {
            if (this.column_id == 'fourth') {
                this.list.push(copy);
                this.saveList();
            }
        });
    }
});




let app = new Vue({
    el: '#app',
    methods:{
        create_new_card(){
            eventBus.$emit('need-create-card');
        }
    }
})