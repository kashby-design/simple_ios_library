
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.32.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/App.svelte generated by Svelte v3.32.1 */

    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let div2;
    	let div1;
    	let span;
    	let t1;
    	let div0;
    	let iframe;
    	let iframe_src_value;
    	let t2;
    	let h1;
    	let t4;
    	let div9;
    	let div3;
    	let h20;
    	let t6;
    	let img0;
    	let img0_src_value;
    	let t7;
    	let div5;
    	let div4;
    	let img1;
    	let img1_src_value;
    	let t8;
    	let h21;
    	let t10;
    	let ul0;
    	let li0;
    	let t12;
    	let li1;
    	let t14;
    	let li2;
    	let t16;
    	let div7;
    	let div6;
    	let img2;
    	let img2_src_value;
    	let t17;
    	let h22;
    	let t19;
    	let ul1;
    	let li3;
    	let t21;
    	let li4;
    	let t23;
    	let li5;
    	let t25;
    	let li6;
    	let t27;
    	let li7;
    	let t29;
    	let li8;
    	let t31;
    	let div8;
    	let h23;
    	let t33;
    	let script;
    	let script_src_value;
    	let a;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div2 = element("div");
    			div1 = element("div");
    			span = element("span");
    			span.textContent = "×";
    			t1 = space();
    			div0 = element("div");
    			iframe = element("iframe");
    			t2 = space();
    			h1 = element("h1");
    			h1.textContent = "Simple iOS Figma Library";
    			t4 = space();
    			div9 = element("div");
    			div3 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Just the right components to get the job done";
    			t6 = space();
    			img0 = element("img");
    			t7 = space();
    			div5 = element("div");
    			div4 = element("div");
    			img1 = element("img");
    			t8 = space();
    			h21 = element("h2");
    			h21.textContent = "Problem";
    			t10 = space();
    			ul0 = element("ul");
    			li0 = element("li");
    			li0.textContent = "Many libraries have so many components, it’s hard to find the one your\n          looking for.";
    			t12 = space();
    			li1 = element("li");
    			li1.textContent = "Everything is laid out, but not grouped by developer naming\n          conventions";
    			t14 = space();
    			li2 = element("li");
    			li2.textContent = "Too many options for a single component, make it hard to get started";
    			t16 = space();
    			div7 = element("div");
    			div6 = element("div");
    			img2 = element("img");
    			t17 = space();
    			h22 = element("h2");
    			h22.textContent = "Solution";
    			t19 = space();
    			ul1 = element("ul");
    			li3 = element("li");
    			li3.textContent = "Essential components to get you started";
    			t21 = space();
    			li4 = element("li");
    			li4.textContent = "Organized with HIG in mind. Grouped by views, controls, and bars";
    			t23 = space();
    			li5 = element("li");
    			li5.textContent = "Variant options if you need them";
    			t25 = space();
    			li6 = element("li");
    			li6.textContent = "I use these components on a daily basis to work on my the app";
    			t27 = space();
    			li7 = element("li");
    			li7.textContent = "Only include light mode to allow you to focus on the work, not the\n          options";
    			t29 = space();
    			li8 = element("li");
    			li8.textContent = "Get a mockup fast to validate your ideas";
    			t31 = space();
    			div8 = element("div");
    			h23 = element("h2");
    			h23.textContent = "Purchase for only 1$";
    			t33 = space();
    			script = element("script");
    			a = element("a");
    			a.textContent = "Get Me My File";
    			attr_dev(span, "class", "close svelte-899j29");
    			add_location(span, file, 21, 6, 577);
    			attr_dev(iframe, "title", "Figma File Overview");
    			attr_dev(iframe, "width", "100%");
    			attr_dev(iframe, "height", "500px");
    			if (iframe.src !== (iframe_src_value = "https://www.youtube.com/embed/7Aaohy-xuSc")) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "frameborder", "0");
    			attr_dev(iframe, "allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
    			iframe.allowFullscreen = true;
    			add_location(iframe, file, 23, 8, 654);
    			add_location(div0, file, 22, 6, 640);
    			attr_dev(div1, "class", "modal-content svelte-899j29");
    			add_location(div1, file, 20, 4, 543);
    			attr_dev(div2, "id", "myModal");
    			attr_dev(div2, "class", "modal svelte-899j29");
    			add_location(div2, file, 18, 2, 479);
    			attr_dev(h1, "class", "svelte-899j29");
    			add_location(h1, file, 36, 2, 1012);
    			attr_dev(h20, "class", "svelte-899j29");
    			add_location(h20, file, 39, 6, 1107);
    			if (img0.src !== (img0_src_value = "images/video_thumbnail.jpg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "width", "100%");
    			attr_dev(img0, "alt", "Figma iOS 14 simple componenent library overview video thumbnail, click to see video");
    			set_style(img0, "border-radius", "1rem");
    			set_style(img0, "cursor", "pointer");
    			add_location(img0, file, 41, 6, 1206);
    			attr_dev(div3, "class", "overview grid-item svelte-899j29");
    			add_location(div3, file, 38, 4, 1068);
    			if (img1.src !== (img1_src_value = "images/problem_icon.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "cloud with questions marks");
    			add_location(img1, file, 51, 8, 1552);
    			attr_dev(h21, "class", "svelte-899j29");
    			add_location(h21, file, 52, 8, 1631);
    			attr_dev(div4, "class", "align-center svelte-899j29");
    			add_location(div4, file, 50, 6, 1517);
    			attr_dev(li0, "class", "svelte-899j29");
    			add_location(li0, file, 55, 8, 1680);
    			attr_dev(li1, "class", "svelte-899j29");
    			add_location(li1, file, 59, 8, 1811);
    			attr_dev(li2, "class", "svelte-899j29");
    			add_location(li2, file, 63, 8, 1930);
    			attr_dev(ul0, "class", "svelte-899j29");
    			add_location(ul0, file, 54, 6, 1667);
    			attr_dev(div5, "class", "problem grid-item svelte-899j29");
    			add_location(div5, file, 49, 4, 1479);
    			if (img2.src !== (img2_src_value = "images/solution_icon.svg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "Light bulb");
    			add_location(img2, file, 70, 8, 2129);
    			attr_dev(h22, "class", "svelte-899j29");
    			add_location(h22, file, 71, 8, 2193);
    			attr_dev(div6, "class", "align-center svelte-899j29");
    			add_location(div6, file, 69, 6, 2094);
    			attr_dev(li3, "class", "svelte-899j29");
    			add_location(li3, file, 74, 8, 2243);
    			attr_dev(li4, "class", "svelte-899j29");
    			add_location(li4, file, 75, 8, 2300);
    			attr_dev(li5, "class", "svelte-899j29");
    			add_location(li5, file, 78, 8, 2402);
    			attr_dev(li6, "class", "svelte-899j29");
    			add_location(li6, file, 79, 8, 2452);
    			attr_dev(li7, "class", "svelte-899j29");
    			add_location(li7, file, 80, 8, 2531);
    			attr_dev(li8, "class", "svelte-899j29");
    			add_location(li8, file, 84, 8, 2653);
    			attr_dev(ul1, "class", "svelte-899j29");
    			add_location(ul1, file, 73, 6, 2230);
    			attr_dev(div7, "class", "solution grid-item svelte-899j29");
    			add_location(div7, file, 68, 4, 2055);
    			attr_dev(h23, "class", "svelte-899j29");
    			add_location(h23, file, 88, 6, 2769);
    			if (script.src !== (script_src_value = "https://gumroad.com/js/gumroad.js")) attr_dev(script, "src", script_src_value);
    			add_location(script, file, 89, 6, 2805);
    			attr_dev(a, "class", "gumroad-button");
    			attr_dev(a, "href", "https://gum.co/ZmlqZ");
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "data-gumroad-single-product", "true");
    			add_location(a, file, 89, 63, 2862);
    			attr_dev(div8, "class", "purchase grid-item svelte-899j29");
    			add_location(div8, file, 87, 4, 2730);
    			attr_dev(div9, "id", "grid");
    			attr_dev(div9, "class", "svelte-899j29");
    			add_location(div9, file, 37, 2, 1048);
    			attr_dev(main, "class", "svelte-899j29");
    			add_location(main, file, 16, 0, 449);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div2);
    			append_dev(div2, div1);
    			append_dev(div1, span);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, iframe);
    			append_dev(main, t2);
    			append_dev(main, h1);
    			append_dev(main, t4);
    			append_dev(main, div9);
    			append_dev(div9, div3);
    			append_dev(div3, h20);
    			append_dev(div3, t6);
    			append_dev(div3, img0);
    			append_dev(div9, t7);
    			append_dev(div9, div5);
    			append_dev(div5, div4);
    			append_dev(div4, img1);
    			append_dev(div4, t8);
    			append_dev(div4, h21);
    			append_dev(div5, t10);
    			append_dev(div5, ul0);
    			append_dev(ul0, li0);
    			append_dev(ul0, t12);
    			append_dev(ul0, li1);
    			append_dev(ul0, t14);
    			append_dev(ul0, li2);
    			append_dev(div9, t16);
    			append_dev(div9, div7);
    			append_dev(div7, div6);
    			append_dev(div6, img2);
    			append_dev(div6, t17);
    			append_dev(div6, h22);
    			append_dev(div7, t19);
    			append_dev(div7, ul1);
    			append_dev(ul1, li3);
    			append_dev(ul1, t21);
    			append_dev(ul1, li4);
    			append_dev(ul1, t23);
    			append_dev(ul1, li5);
    			append_dev(ul1, t25);
    			append_dev(ul1, li6);
    			append_dev(ul1, t27);
    			append_dev(ul1, li7);
    			append_dev(ul1, t29);
    			append_dev(ul1, li8);
    			append_dev(div9, t31);
    			append_dev(div9, div8);
    			append_dev(div8, h23);
    			append_dev(div8, t33);
    			append_dev(div8, script);
    			append_dev(div8, a);

    			if (!mounted) {
    				dispose = [
    					listen_dev(span, "click", closeModal, false, false, false),
    					listen_dev(img0, "click", openModal, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function openModal() {
    	document.getElementById("myModal").style.display = "block";
    }

    function closeModal() {
    	document.getElementById("myModal").style.display = "none";
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	window.onclick = function (event) {
    		if (event.target == document.getElementById("myModal")) {
    			document.getElementById("myModal").style.display = "none";
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ openModal, closeModal });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		// name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
