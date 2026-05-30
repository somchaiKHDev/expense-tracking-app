class LoadingStore {
	#active = $state(false);

	get active() {
		return this.#active;
	}

	show() {
		this.#active = true;
	}

	hide() {
		this.#active = false;
	}

	async wrap<T>(fn: () => Promise<T> | T): Promise<T> {
		this.show();
		try {
			return await fn();
		} finally {
			this.hide();
		}
	}
}

const loadingStore = new LoadingStore();

export function useLoading() {
	return loadingStore;
}
