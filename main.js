// 將VeeValidate宣告引用內部的方法
const { Form, Field, ErrorMessage, defineRule, configure } = VeeValidate;
//
const { email, required, min, max } = VeeValidateRules;
defineRule('required', required);
defineRule('email', email);
defineRule('min', min);
defineRule('max', max);

const { loadLocaleFromURL, localize } = VeeValidateI18n;
// 語言包網址
loadLocaleFromURL(
  'https://unpkg.com/@vee-validate/i18n@4.1.0/dist/locale/zh_TW.json'
);
configure({
  generateMessage: localize('zh_TW'),
  validateOnInput: true,
});

const apiUrl = 'https://vue3-course-api.hexschool.io/v2';
const apiPath = 'camelpath2';

const userModal = {
  props: ['tempProduct', 'addToCart'],
  data() {
    return {
      productModal: null,
      qty: 1,
    };
  },
  methods: {
    open() {
      this.productModal.show();
    },
    close() {
      this.productModal.hide();
    },
  },
  watch: {
    tempProduct() {
      this.qty = 1;
    },
  },
  template: '#userProductModal',
  mounted() {
    this.productModal = new bootstrap.Modal(this.$refs.modal);
  },
};

const app = Vue.createApp({
  data() {
    return {
      products: [],
      tempProduct: {},
      status: {
        addCartLoading: '',
        cartQtyLoading: '',
      },
      carts: {},
      form: {
        user: {
          name: '',
          email: '',
          phone: '',
          address: '',
        },
        message: '',
      },
    };
  },
  components: {
    userModal,
    VForm: Form,
    VField: Field,
    ErrorMessage: ErrorMessage,
  },
  methods: {
    getProducts() {
      axios.get(`${apiUrl}/api/${apiPath}/products/all`).then((res) => {
        this.products = res.data.products;
      });
    },
    openModal(product) {
      this.tempProduct = product;
      this.$refs.userModal.open();
    },
    addToCart(product_id, qty = 1) {
      const order = {
        product_id,
        qty,
      };
      this.status.addCartLoading = product_id;

      axios
        .post(`${apiUrl}/api/${apiPath}/cart`, { data: order })
        .then((res) => {
          this.status.addCartLoading = '';
          this.getCart();
          this.$refs.userModal.close();
        });
    },
    changeCartQty(item, qty = 1) {
      const order = {
        product_id: item.product_id,
        qty,
      };
      this.status.cartQtyLoading = item.id;

      axios
        .put(`${apiUrl}/api/${apiPath}/cart/${item.id}`, { data: order })
        .then((res) => {
          (this.status.cartQtyLoading = ''), this.getCart();
        });
    },
    getCart() {
      axios.get(`${apiUrl}/api/${apiPath}/cart`).then((res) => {
        this.carts = res.data.data;
        // console.log(this.carts);
      });
    },
    removeCartItem(id) {
      this.status.cartQtyLoading = id;
      axios.delete(`${apiUrl}/api/${apiPath}/cart/${id}`).then((res) => {
        (this.status.cartQtyLoading = ''), this.getCart();
      });
    },
    //form自訂義驗證方法
    isPhone(value) {
      const phoneNumber = /^(09)[0-9]{8}$/;
      return phoneNumber.test(value) ? true : '需要正確的電話號碼';
    },
  },
  mounted() {
    this.getProducts();
    this.getCart();
  },
});

app.mount('#app');
