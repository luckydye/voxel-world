export class DialogBox extends HTMLElement {

	static template(args) {
		return `
			<style>
				:host {
					--submitText: "Submit";
					--cancelText: "Cancel";
				}

				:host {
					z-index: 10000;
					display: flex;
					flex-direction: column;
					background: rgba(28, 28, 28, 0.98);
					border: 1px solid rgba(60, 60, 60, 0.9);
					border-radius: 3px;
					padding: 10px;
					min-width: 350px;
					position: absolute;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);
					color: #c1c1c1;
					font-family: sans-serif;
					animation: showDialog .15s;
				}

				@keyframes showDialog {
					from { opacity: 0; transform: translate(-50%, calc(-50% - 20px)); }
				}

				@keyframes hideDialog {
					to { opacity: 0; transform: translate(-50%, calc(-50% + 20px)); }
				}

				.title {
					text-transform: uppercase;
					font-size: 14px;
					margin-bottom: 15px;
					line-height: 100%;
					text-align: center;
				}

				.content { }

				.footer {
					display: flex;
					justify-content: space-between;
				}

				.field-row {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-bottom: 5px;
				}

				.field-row label {
					font-size: 14px;
				}

				.field-row input {
					padding: 4px 5px;
					color: #eee;
					border: 1px solid black;
					background: #1c1c1c;
					outline: none;
				}

				button {
					margin-top: 10px;
					background: hsla(213, 0%, 48%, 1);
					border-radius: 3px;
					outline: none;
					color: #eee;
					padding: 6px 15px;
					font-size: 14px;
					border: none;
					cursor: pointer;
					align-self: flex-end;
					transition: .1s ease-out;
				}
				button:hover {
					background: hsl(213, 0%, 57%);
				}
				button:active {
					background: hsl(213, 0%, 40%);
					transition: .05s ease-out;
					transform: scale(0.995);
				}

				.cancel:before {
					content: var(--cancelText);
				}

				.submit {
					background: #3c74b9;
				}
				.submit:before {
					content: var(--submitText);
				}
				.submit:hover {
					background: #4d8bd8;
				}
				.submit:active {
					background: #396192;
				}
			</style>
			<div class="title">
				<a>${args.name}</a>
			</div>
			<div class="content"></div>
			<div class="footer">
				<button class="cancel"></button>
				<button class="submit"></button>
			</div>
		`;
	}

	get isInstanced() {
		const instance = document.querySelector(`dialog-box[data-id="${this.name}"]`);
		return instance || false;
	}

	constructor(name) {
		super();

		this.name = name || "Dialog Box";
		this.fields = [];

		const instance = this.isInstanced;
		if(instance) instance.cancel();

		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = this.constructor.template({ name: this.name });

		this.shadowRoot.querySelector('button.submit')
			.onclick = () => this.submit();
			
		this.shadowRoot.querySelector('button.cancel')
			.onclick = () => this.cancel();
			
		this.shadowRoot.addEventListener('input', () => {
			this.onChange();
		})

		this.dataset.id = this.name;
	}

	addField(field) {
		this.fields.push(field);
		const ele = document.createElement("div");
		ele.className = "field-row";
		switch(field.type) {
			case 'number':
				ele.innerHTML = `
					<label>${field.name}</label>
					<input step="${field.steps || 0.1}" type="number" id="${field.id}" placeholder="${field.default}" value="${field.default}"/>
				`;
				break;
			default:
				ele.innerHTML = `
					<label>${field.name}</label>
					<input id="${field.id}" placeholder="${field.default}" value="${field.default}"/>
				`;
		}
		this.shadowRoot.querySelector('.content').appendChild(ele);
	}

	onChange() {
		const e = new CustomEvent('change', {
			detail: this.values()
		});
		this.dispatchEvent(e);
	}

	values() {
		const data = {};
		for(let field of this.fields) {
			let value;
			switch(field.type) {
				case 'number':
					value = this.shadowRoot.querySelector('#' + field.id).valueAsNumber;
					break;
				default:
					value = this.shadowRoot.querySelector('#' + field.id).value;
			}
			data[field.id] = value;
		}
		return data;
	}

	submit() {
		const e = new CustomEvent('submit', {
			detail: this.values()
		});
		this.dispatchEvent(e);

		this.hide();
	}

	cancel() {
		const e = new CustomEvent('cancel');
		this.dispatchEvent(e);
		this.hide();
	}

	hide() {
		this.style.animationName = "hideDialog";
		this.addEventListener('animationend', () => {
			this.remove();
		})
	}

}

customElements.define("dialog-box", DialogBox);
