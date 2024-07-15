document.addEventListener('DOMContentLoaded', () => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const pastOrders = JSON.parse(localStorage.getItem('pastOrders')) || [];
    const overlay = document.getElementById('overlay');
    const cartModal = document.getElementById('cart');
    const accountModal = document.getElementById('account-modal');
    const addressModal = document.getElementById('address-modal');
    const alertModal = document.getElementById('alert-modal');
    const cartIcon = document.getElementById('cart-icon');
    const accountIcon = document.getElementById('account-icon');
    const closeCart = document.getElementById('close-cart');
    const closeAccount = document.getElementById('close-account');
    const closeAddress = document.getElementById('close-address');
    const alertClose = document.getElementById('alert-close');
    const searchInput = document.getElementById('search-input');
    const searchIcon = document.getElementById('search-icon');
    const accountForm = document.getElementById('account-form');
    const addressForm = document.getElementById('address-form');
    const checkoutBtn = document.getElementById('checkout-btn');
    const accountMessage = document.getElementById('account-message');
    const addressMessage = document.getElementById('address-message');
    const accountTitle = document.getElementById('account-title');
    const accountSubmit = document.getElementById('account-submit');
    const toggleAccount = document.getElementById('toggle-account');
    const signInToggle = document.getElementById('sign-in-toggle');

    let isSignedIn = false;
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

    function openModal(modal) {
        modal.style.display = 'block';
        overlay.style.display = 'block';
    }

    function closeModal(modal) {
        modal.style.display = 'none';
        overlay.style.display = 'none';
    }

    function updateCart() {
        const cartItemsContainer = document.querySelector('.cart-items');
        const cartTotal = document.getElementById('cart-total');
        cartItemsContainer.innerHTML = '';
        let total = 0;

        cart.forEach((item, index) => {
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');
            cartItem.innerHTML = `
                <span>${item.name} - ${item.price} L.E</span>
                <div class="quantity-controls">
                    <button class="decrease-quantity" data-index="${index}">-</button>
                    <input type="text" value="${item.quantity}" readonly>
                    <button class="increase-quantity" data-index="${index}">+</button>
                </div>
                <button class="delete-item" data-index="${index}">Delete</button>
            `;
            cartItemsContainer.appendChild(cartItem);
            total += parseFloat(item.price) * item.quantity;
        });

        cartTotal.textContent = total.toFixed(2);
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function updateAdminPage() {
        const adminData = {
            account: currentUser,
            cart,
            address: JSON.parse(localStorage.getItem('address')) || {}
        };
        pastOrders.push(adminData);
        localStorage.setItem('pastOrders', JSON.stringify(pastOrders));
    }

    function resetCart() {
        cart = [];
        localStorage.removeItem('cart');
        updateCart();
    }

    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', event => {
            if (!isSignedIn) {
                openModal(alertModal);
                return;
            }

            const product = event.target.closest('.product');
            const id = product.getAttribute('data-id');
            const name = product.getAttribute('data-name');
            const price = product.getAttribute('data-price');

            const existingItem = cart.find(item => item.id === id);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({ id, name, price, quantity: 1 });
            }

            updateCart();
        });
    });

    cartIcon.addEventListener('click', () => {
        if (!isSignedIn) {
            openModal(alertModal);
            return;
        }

        updateCart();
        openModal(cartModal);
    });

    accountIcon.addEventListener('click', () => {
        openModal(accountModal);
    });

    closeCart.addEventListener('click', () => {
        closeModal(cartModal);
    });

    closeAccount.addEventListener('click', () => {
        closeModal(accountModal);
    });

    closeAddress.addEventListener('click', () => {
        closeModal(addressModal);
    });

    alertClose.addEventListener('click', () => {
        closeModal(alertModal);
    });

    overlay.addEventListener('click', () => {
        closeModal(cartModal);
        closeModal(accountModal);
        closeModal(addressModal);
        closeModal(alertModal);
    });

    searchIcon.addEventListener('click', () => {
        const query = searchInput.value.toLowerCase();
        document.querySelectorAll('.product').forEach(product => {
            const name = product.getAttribute('data-name').toLowerCase();
            product.style.display = name.includes(query) ? 'block' : 'none';
        });
    });

    accountForm.addEventListener('submit', event => {
        event.preventDefault();
        const username = event.target.username.value;
        const email = event.target.email.value;
        const password = event.target.password.value;
        const accounts = JSON.parse(localStorage.getItem('accounts')) || [];

        if (accountTitle.textContent === 'Create Account') {
            if (accounts.some(account => account.email === email)) {
                accountMessage.textContent = 'Account already exists.';
                accountMessage.style.color = 'red';
            } else {
                const newAccount = { username, email, password };
                accounts.push(newAccount);
                localStorage.setItem('accounts', JSON.stringify(accounts));
                currentUser = newAccount;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                accountMessage.textContent = 'Account created successfully.';
                accountMessage.style.color = 'green';
                isSignedIn = true;
                accountIcon.innerHTML = `<i class="fas fa-user"></i> ${username}`;
                closeModal(accountModal);
            }
        } else {
            const account = accounts.find(account => account.email === email && account.password === password);
            if (account) {
                currentUser = account;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                accountMessage.textContent = 'Signed in successfully.';
                accountMessage.style.color = 'green';
                isSignedIn = true;
                accountIcon.innerHTML = `<i class="fas fa-user"></i> ${account.username}`;
                closeModal(accountModal);
            } else {
                accountMessage.textContent = 'Invalid email or password.';
                accountMessage.style.color = 'red';
            }
        }
    });

    addressForm.addEventListener('submit', event => {
        event.preventDefault();
        const address = event.target.address.value;
        const city = event.target.city.value;
        const state = event.target.state.value;
        const zip = event.target.zip.value;
        const contact = event.target.contact.value;

        if (address && city && state && zip && contact) {
            const addressInfo = { address, city, state, zip, contact };
            localStorage.setItem('address', JSON.stringify(addressInfo));
            addressMessage.textContent = 'Address saved successfully.';
            addressMessage.style.color = 'green';
            closeModal(addressModal);
            updateAdminPage();
            resetCart();
        } else {
            addressMessage.textContent = 'Please fill out all fields.';
            addressMessage.style.color = 'red';
        }
    });

    checkoutBtn.addEventListener('click', () => {
        openModal(addressModal);
    });

    toggleAccount.addEventListener('click', () => {
        const isCreatingAccount = accountTitle.textContent === 'Create Account';
        accountTitle.textContent = isCreatingAccount ? 'Sign In' : 'Create Account';
        accountSubmit.textContent = isCreatingAccount ? 'Sign In' : 'Create Account';
        signInToggle.textContent = isCreatingAccount ? 'Create Account' : 'Sign In';
    });

    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('increase-quantity')) {
            const index = event.target.getAttribute('data-index');
            cart[index].quantity++;
            updateCart();
        }

        if (event.target.classList.contains('decrease-quantity')) {
            const index = event.target.getAttribute('data-index');
            if (cart[index].quantity > 1) {
                cart[index].quantity--;
                updateCart();
            }
        }

        if (event.target.classList.contains('delete-item')) {
            const index = event.target.getAttribute('data-index');
            cart.splice(index, 1);
            updateCart();
        }
    });
});

const aboutIcon = document.getElementById('about-icon');
const contactIcon = document.getElementById('contact-icon');

aboutIcon.addEventListener('click', () => {
    document.getElementById('about-us').scrollIntoView({ behavior: 'smooth' });
});

contactIcon.addEventListener('click', () => {
    document.getElementById('contact-info').scrollIntoView({ behavior: 'smooth' });
});
document.addEventListener("DOMContentLoaded", function () {
    const products = document.querySelectorAll(".product");

    products.forEach(product => {
        const images = product.querySelectorAll(".product-image");
        const prevButton = product.querySelector(".prev");
        const nextButton = product.querySelector(".next");
        let currentIndex = 0;

        function showImage(index) {
            images.forEach((img, i) => {
                img.classList.toggle("active", i === index);
            });
        }

        prevButton.addEventListener("click", function () {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            showImage(currentIndex);
        });

        nextButton.addEventListener("click", function () {
            currentIndex = (currentIndex + 1) % images.length;
            showImage(currentIndex);
        });

        showImage(currentIndex); // Initialize first image as active
    });
});
document.addEventListener('DOMContentLoaded', () => {
    let password = '123456789';

    const adminButton = document.getElementById('adminButton');
    const changePasswordLink = document.getElementById('changePasswordLink');
    const passwordModal = document.getElementById('passwordModal');
    const changePasswordModal = document.getElementById('changePasswordModal');
    const passwordInput = document.getElementById('passwordInput');
    const oldPasswordInput = document.getElementById('oldPasswordInput');
    const newPasswordInput = document.getElementById('newPasswordInput');
    const submitPassword = document.getElementById('submitPassword');
    const submitNewPassword = document.getElementById('submitNewPassword');
    const closeButtons = document.querySelectorAll('.close');

    adminButton.addEventListener('click', () => {
        passwordModal.style.display = 'block';
    });

    changePasswordLink.addEventListener('click', () => {
        changePasswordModal.style.display = 'block';
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            passwordModal.style.display = 'none';
            changePasswordModal.style.display = 'none';
        });
    });

    submitPassword.addEventListener('click', () => {
        if (passwordInput.value === password) {
            window.location.href = 'admin.html';
        } else {
            alert('Incorrect password');
        }
        passwordModal.style.display = 'none';
    });

    submitNewPassword.addEventListener('click', () => {
        if (oldPasswordInput.value === password) {
            password = newPasswordInput.value;
            alert('Password changed successfully');
        } else {
            alert('Incorrect old password');
        }
        changePasswordModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === passwordModal) {
            passwordModal.style.display = 'none';
        }
        if (event.target === changePasswordModal) {
            changePasswordModal.style.display = 'none';
        }
    });
});
