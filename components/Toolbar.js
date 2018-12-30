export class Toolbar extends HTMLElement {

	static get template() {
		return `
			<style>
				:host {
					display: inline-block;
				}

				.toolbar {
					position: relative;
					background: white;
					border-radius: 5px;
					overflow: hidden;
					width: 40px;
					box-shadow: 1px 2px 8px rgba(0, 0, 0, 0.15);
				}
				
				.selection {
					border-radius: 5px;
					width: 100%;
					height: 100%;
					background: #f7f7f7;
					position: absolute;
					top: 3px;
					opacity: 0;
					z-index: 1000;
					transform: scale(1.2);
					pointer-events: none;
					transition: opacity .2s ease-out,
								height .4s ease-out,
								transform .3s ease-out;
				}
				
				.toolbar:hover .selection {
					height: 40px;
					opacity: 0.1;
					transform: translateY(calc(var(--my) * 1px)) scale(0.95);
					transition: opacity .1s ease-out,
								height .12s ease-out,
								transform .05s ease-out;
				}
				
				.tools {
					z-index: 100;
					position: relative;
				}
				
				:host([theme="dark"]) .toolbar {
					background: transparent;
				}
				
				:host([theme="dark"]) .selection {
					background: rgb(255, 255, 255);
				}
			</style>
			<span class="selection"></span>
			<div class="tools">
				<slot></slot>
			</div>
		`;
	}

	get theme() {
		return this.getAttribute("theme") || "light";
	}

	set theme(val) {
		this.setAttribute("theme", val);
	}

	constructor({ theme }) {
		super();
		this.theme = theme;
	}

	applyTemplate() {
		const element = document.createElement("div");
		element.className = "toolbar";
		element.innerHTML = this.constructor.template;
		this.attachShadow({ mode: "open" });
		this.shadowRoot.appendChild(element);
	}

	connectedCallback() {
		this.applyTemplate();
		
		this.selector = this.shadowRoot.querySelector(".selection");
		this.itemHeight = this.clientWidth;

		const toolsWrapper = this.shadowRoot.querySelector(".tools");
		toolsWrapper.addEventListener("mousemove", e => this.handleMouse(e));
	}

	handleMouse(e) {
		const bounds = this.getClientRects()[0];
		const i = Math.floor((e.clientY - bounds.y) / this.itemHeight);
		this.selector.style.setProperty("--my", i * this.itemHeight);
	}
}

export class Tool extends HTMLElement {

	static get template() {
		return `
			<style>
				:host {
					display: block;
				}
				
				.tool {
					margin-top: 1px;
					user-select: none;
					width: 40px;
					height: 40px;
					display: flex;
					justify-content: center;
					align-items: center;
					font-family: sans-serif;
					color: white;
					font-size: 20px;
					cursor: pointer;
					transition: background .1s ease-out;
					background: rgba(28, 28, 28, 0.75);
				}

				:host([active]),
				:host(:active) {
					background: rgba(0, 0, 0, 0.1);
				}
			</style>
			<slot></slot>
		`;
	}

	set active(bool) {
		if(bool) {
			this.setAttribute("active", "");
		} else {
			this.removeAttribute("active");
		}
		this.dispatchEvent(new Event("change"));
	}

	get active() {
		return this.hasAttribute("active");
	}

	applyTemplate() {
		const element = document.createElement("div");
		element.className = "tool";
		element.innerHTML = this.constructor.template;
		this.attachShadow({ mode: "open" });
		this.shadowRoot.appendChild(element);
	}

	connectedCallback() {
		this.applyTemplate();
	}
}

export function IconButton({icon, activeIcon, onclick, tooltip, activeDefault}) {
	const ele = document.createElement("tb-tool");
	ele.innerHTML = `${icon}`;
	ele.onchange = () => {
		if(activeIcon) {
			ele.innerHTML = ele.active ? `${activeIcon}`: `${icon}`;
		}
	}
	ele.onclick = () => {
		if(activeIcon) {
			ele.active = !ele.active;
		}
		onclick(ele);
	}
	if(tooltip) {
		ele.title = tooltip;
	}
	if(activeDefault) {
		ele.active = true;
	}
	return ele;
}

customElements.define("tb-toolbar", Toolbar);
customElements.define("tb-tool", Tool);
