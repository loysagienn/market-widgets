'use strict';

function showPopup(content, timeout = 5000) {
    if (timeout > 60000) {
        throw new Error('Popup: timeout must be less than 1 minute');
    }

    const popup = document.querySelector('.popup');

    popup.style.display = 'block';
    popup.innerHTML = content;

    setTimeout(() => {
        popup.style.display = 'none';
    }, timeout);
}

function renderProduct(product) {
    const element = document.createElement('div');
    
    element.classList.add('product');

    element.innerHTML = `
        <div class="section">
            <img class="image" src="${product.imageUrl}">
        </div>

        <div class="section">
            <span class="name">
                ${product.name}

                ${product.count > 1 ? `<span>${product.count} шт.</span>` : ``}
            </span>

            <span class="price">${product.price} ₽</span>
        </div>
    `;

    return element;
}

function renderCart(places, rootNodeSelector) {
    const rootNode = document.querySelector(rootNodeSelector);

    places.forEach(({items}) => {
        items.forEach(item => {
            const element = renderProduct(item);
    
            rootNode.appendChild(element);
        });
    });
}

function getDataFromForm() {
    return {
        firstName: document.querySelector('#firstName').value,
        lastName: document.querySelector('#lastName').value,
        phone: document.querySelector('#phone').value,
        email: document.querySelector('#email').value,
        locality: document.querySelector('#locality').value,
        street: document.querySelector('#street').value,
    };
}
