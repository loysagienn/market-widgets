(function() {
    const setPosition = (input, suggest) => {
        const {left, bottom} = input.getBoundingClientRect();

        suggest.style.left = `${left}px`;
        suggest.style.top = `${bottom}px`;
    }

    const createSuggestNode = () => {
        const suggestNode = document.createElement('div');
        
        suggestNode.classList.add('suggest');
        suggestNode.style.display = 'none';
        // чтобы не сбрасывался фокус в инпуте
        suggestNode.addEventListener('mousedown', event => event.preventDefault());

        return suggestNode;
    }

    class Suggest {
        constructor(input, onSelect) {
            this.items = [];
            this.onSelect = onSelect;
            this.isVisible = false;
            this.inputNode = input;
            this.suggestNode = createSuggestNode();
            document.body.appendChild(this.suggestNode);

            input.addEventListener('focus', () => this.show());
            input.addEventListener('blur', () => this.hide());

            this.setPosition = () => setPosition(this.inputNode, this.suggestNode);
        }

        setItems(items) {
            this.items = items;

            this.suggestNode.innerHTML = '';

            items.forEach(item => {
                const node = document.createElement('div');
                node.classList.add('suggest-item');

                node.appendChild(document.createTextNode(item.name));
                node.title = item.fullName;
                node.addEventListener('click', () => {
                    this.inputNode.value = item.name;
                    this.items = [];
                    this.hide();
                    this.onSelect(item);
                    this.inputNode.blur();
                });

                this.suggestNode.appendChild(node);
            });

            if (items.length) {
                this.show();
            } else {
                this.hide();
            }
        }

        show() {
            if (!this.items.length || this.isVisible) {
                return;
            }

            this.suggestNode.style.display = 'block';
    
            this.setPosition();
            window.addEventListener('scroll', this.setPosition, true);
            this.isVisible = true;
        }
    
        hide() {
            if (!this.isVisible) {
                return;
            }
            window.removeEventListener('scroll', this.setPosition, true);

            this.suggestNode.style.display = 'none';
            this.isVisible = false;
        }
    }


    window.Suggest = Suggest;
})();
