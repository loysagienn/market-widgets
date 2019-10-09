'use strict';

// Товары в корзине.
const places = [
    {
        items: [
            {
                // Поля, относящиеся к Доставке.
                // externalId - доп. поле с id товара. Обычно партнёры в него передают артикул товара.
                // externalId: 12345,
                name: 'Смартфон Apple iPhone Xs 64Gb',
                price: 79990,
                assessedValue: 799990,
                count: 1,
                tax: 'VAT_20',

                dimensions: {
                    width: 10,
                    length: 10,
                    height: 10,
                    weight: 0.25,
                },

                // Поля, НЕ относящиеся к Доставке.
                // imageUrl - доп. поле, добавленное для отображения фотографии товара.
                imageUrl: 'https://avatars.mds.yandex.net/get-mpic/1101307/img_id2659510310525421445.jpeg/orig',
            },
            {
                // Поля, относящиеся к Доставке.
                // externalId - доп. поле с id товара. Обычно партнёры в него передают артикул товара.
                // externalId: 12345,
                name: 'Ноутбук Apple MacBook Pro 13 2019',
                price: 159990,
                assessedValue: 159990,
                count: 1,
                tax: 'VAT_20',

                dimensions: {
                    width: 10,
                    height: 10,
                    length: 10,
                    weight: 2,
                },

                // Поля, НЕ относящиеся к Доставке.
                // imageUrl - доп. поле, добавленное для отображения фотографии товара. К Доставке отношения не имеет.
                imageUrl: 'https://avatars.mds.yandex.net/get-mpic/1925870/img_id8790934455192967560.jpeg/orig',
            },
            {
                // Поля, относящиеся к Доставке.
                // externalId - доп. поле с id товара. Обычно партнёры в него передают артикул товара.
                // externalId: 12345,
                name: 'Планшет Apple iPad Pro 11 64Gb',
                price: 59990,
                assessedValue: 59990,
                count: 2,
                tax: 'VAT_20',

                dimensions: {
                    width: 10,
                    height: 10,
                    length: 10,
                    weight: 0.8,
                },

                // Поля, НЕ относящиеся к Доставке.
                // imageUrl - доп. поле, добавленное для отображения фотографии товара. К Доставке отношения не имеет.
                imageUrl: 'https://avatars.mds.yandex.net/get-mpic/1605421/img_id8321434227649364658.jpeg/orig',
            },
        ],
    }
];

// 213 -- Москва
// 2 -- Санкт-Петербург
const userRegion = {
    id: 213,
    name: 'Москва'
}

const deliverySearchParams = {
    places,
};

// Форма оформления заказа.
const form = document.querySelector('#checkout');
const regionInput = document.querySelector('#locality');
// Жёлтая кнопка с надписью «Яндекс.Доставка».
const yaDeliveryButton = document.querySelector('#yaDelivery');

form.addEventListener('submit', event => void event.preventDefault());

function successWidgetLoad(widget) {
    // Эта функция будет вызвана, если виджет успешно создастся.

    // Пропихиваем в инпут автоопределенный виджетом регион
    widget.getRegion().then(({name}) => regionInput.value = name);

    // Создаем саджест для региона, сам код саджеста находится в файле suggest.js
    // Тут мы передаем в этот саджест элемент инпута и функцию для прокидывания выбранного региона в виджет
    const suggest = new Suggest(regionInput, region => (
        // Саджест вызывает эту функцию, когда пользователь кликает в какой-то элемент внутри саджеста
        // и мы пробрасываем выбранный регион в виджет
        widget.setRegion(region)
            .catch(error => void console.log('setRegion Error', error))
    ));

    regionInput.addEventListener('input', async () => {
        // Этот обработчик выполняется на каждый ввод символа в инпуте
        const term = regionInput.value;

        if (!term) {
            return;
        }

        // Ищем регионы по строке из инпута
        const regions = await widget.getRegionsByName(term);

        // Пропихиваем найденные регионы в саджест
        suggest.setItems(regions);
    });

    // При клике на кнопку «Яндекс.Доставка» у виджета вызывается
    // метод showDeliveryOptions с переданными параметрами. На основе
    // этих параметров, а именно (на тек. момент) geoId и товаров в корзине вычисляются
    // возможные способы доставки товара из точки А в точку Б.
    yaDeliveryButton.addEventListener('click', () => {
        widget.showDeliveryOptions(deliverySearchParams);
    });

    // У виджета появились события, которыми он делится с партнёром для
    // более глубокой интеграции виджета с сайтом партнёра.
    // В конструкции ниже идёт подписка на событие submitDeliveryOption,
    // которое происходит при выборе пользователем в виджете варианта доставки.
    // В нашем случае мы, будучи якобы партнёром, просто покажем попап пользователю
    // об успешном выборе варианта доставки, но вместе с событием виджет поделится
    // информацией о доставке с партнёром, который может использовать это для своих
    // целей (в нашем случае они упадут в консоль). 
    widget.on('submitDeliveryOption', data => {
        showPopup('Выбран вариант доставки! :)');

        console.log('submitDeliveryOptionData', data);
    });

    // Тут мы подписываемся на сабмит формы заказа. При нажатии на кнопку
    // «Заказать» сработает конструкция ниже.
    form.addEventListener('submit', async () => {
        // С помощью абстрактной функции getDataFromForm мы получаем
        // данные, которые заполнены в самой форме.
        const formData = getDataFromForm();

        // Перед созданием заказа партнёру нужно сформировать
        // объект заказа, который он передаст в виджет.
        // Это важно, так как за всё взаимодействие пользователя с формой
        // для ввода данных отвечает сам партнёр. С нами он только должен
        // этим данными поделиться.
        const params = {
            // externalId: 12345,
            // comment: '',

            recipient: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                email: formData.email,
            },

            address: {
                locality: formData.locality,
                street: formData.street,
            },

            contacts: [
                {
                    type: 'RECIPIENT',
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phone: formData.phone,
                },
            ],

            // cost: {},
        };

        // Когда партнёр сформирует объект заказа и будет готов создать заказ,
        // то при вызове этого метода заказ будет сохранён локально на компьютере
        // пользователя. Этот этап намеренно разделён на 2 шага (этот и дальше), чтобы
        // партнёр смог, если ему понадобиться, сделать промежуточный этап при
        // создании заказа. Например, для внедрения оплаты через эквайринг.
        await widget.setOrderInfo(params);

        // При вызове этого метода виджет берёт данные, сохранённые локально
        // на компьютере пользователя и отправляет их на сервер.
        // Черновик заказа создаётся в CMS Яндекс.Доставки.
        await widget.createOrder().then(response => {
            console.log('createOrder', response);

            // Партнёр показывает пользователю попап при успешном создании заказа.
            showPopup('Заказ успешно создан!', 2000);
        });
    });
}

function failureWidgetLoad(error) {
    // Эта функция будет вызвана, если виджет не сможет создаться.

    console.error(error);
}

function startWidget() {
    window.removeEventListener('YaDeliveryLoad', startWidget);

    window.YaDelivery.createWidget({
        containerId: 'deliveryCart',
        type: 'deliveryCart',
        params: {
            senderId: 119,
            apiKey: 'c2cc994b-5736-4645-ad6a-bda92c757395',
        },
    }).then(successWidgetLoad).catch(failureWidgetLoad);
}

window.YaDelivery
    ? startWidget()
    : window.addEventListener('YaDeliveryLoad', startWidget);


renderCart(places, '.products');
