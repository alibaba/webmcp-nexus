//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod), cb = null), mod.exports);
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
//#endregion
//#region \0vite/modulepreload-polyfill.js
(function polyfill() {
	const relList = document.createElement("link").relList;
	if (relList && relList.supports && relList.supports("modulepreload")) return;
	for (const link of document.querySelectorAll("link[rel=\"modulepreload\"]")) processPreload(link);
	new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type !== "childList") continue;
			for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
		}
	}).observe(document, {
		childList: true,
		subtree: true
	});
	function getFetchOpts(link) {
		const fetchOpts = {};
		if (link.integrity) fetchOpts.integrity = link.integrity;
		if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
		if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
		else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
		else fetchOpts.credentials = "same-origin";
		return fetchOpts;
	}
	function processPreload(link) {
		if (link.ep) return;
		link.ep = true;
		const fetchOpts = getFetchOpts(link);
		fetch(link.href, fetchOpts);
	}
})();
//#endregion
//#region ../../node_modules/.pnpm/react@19.2.6/node_modules/react/cjs/react.production.js
/**
* @license React
* react.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
	function getIteratorFn(maybeIterable) {
		if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
		maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
		return "function" === typeof maybeIterable ? maybeIterable : null;
	}
	var ReactNoopUpdateQueue = {
		isMounted: function() {
			return !1;
		},
		enqueueForceUpdate: function() {},
		enqueueReplaceState: function() {},
		enqueueSetState: function() {}
	}, assign = Object.assign, emptyObject = {};
	function Component(props, context, updater) {
		this.props = props;
		this.context = context;
		this.refs = emptyObject;
		this.updater = updater || ReactNoopUpdateQueue;
	}
	Component.prototype.isReactComponent = {};
	Component.prototype.setState = function(partialState, callback) {
		if ("object" !== typeof partialState && "function" !== typeof partialState && null != partialState) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
		this.updater.enqueueSetState(this, partialState, callback, "setState");
	};
	Component.prototype.forceUpdate = function(callback) {
		this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
	};
	function ComponentDummy() {}
	ComponentDummy.prototype = Component.prototype;
	function PureComponent(props, context, updater) {
		this.props = props;
		this.context = context;
		this.refs = emptyObject;
		this.updater = updater || ReactNoopUpdateQueue;
	}
	var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
	pureComponentPrototype.constructor = PureComponent;
	assign(pureComponentPrototype, Component.prototype);
	pureComponentPrototype.isPureReactComponent = !0;
	var isArrayImpl = Array.isArray;
	function noop() {}
	var ReactSharedInternals = {
		H: null,
		A: null,
		T: null,
		S: null
	}, hasOwnProperty = Object.prototype.hasOwnProperty;
	function ReactElement(type, key, props) {
		var refProp = props.ref;
		return {
			$$typeof: REACT_ELEMENT_TYPE,
			type,
			key,
			ref: void 0 !== refProp ? refProp : null,
			props
		};
	}
	function cloneAndReplaceKey(oldElement, newKey) {
		return ReactElement(oldElement.type, newKey, oldElement.props);
	}
	function isValidElement(object) {
		return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
	}
	function escape(key) {
		var escaperLookup = {
			"=": "=0",
			":": "=2"
		};
		return "$" + key.replace(/[=:]/g, function(match) {
			return escaperLookup[match];
		});
	}
	var userProvidedKeyEscapeRegex = /\/+/g;
	function getElementKey(element, index) {
		return "object" === typeof element && null !== element && null != element.key ? escape("" + element.key) : index.toString(36);
	}
	function resolveThenable(thenable) {
		switch (thenable.status) {
			case "fulfilled": return thenable.value;
			case "rejected": throw thenable.reason;
			default: switch ("string" === typeof thenable.status ? thenable.then(noop, noop) : (thenable.status = "pending", thenable.then(function(fulfilledValue) {
				"pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
			}, function(error) {
				"pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
			})), thenable.status) {
				case "fulfilled": return thenable.value;
				case "rejected": throw thenable.reason;
			}
		}
		throw thenable;
	}
	function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
		var type = typeof children;
		if ("undefined" === type || "boolean" === type) children = null;
		var invokeCallback = !1;
		if (null === children) invokeCallback = !0;
		else switch (type) {
			case "bigint":
			case "string":
			case "number":
				invokeCallback = !0;
				break;
			case "object": switch (children.$$typeof) {
				case REACT_ELEMENT_TYPE:
				case REACT_PORTAL_TYPE:
					invokeCallback = !0;
					break;
				case REACT_LAZY_TYPE: return invokeCallback = children._init, mapIntoArray(invokeCallback(children._payload), array, escapedPrefix, nameSoFar, callback);
			}
		}
		if (invokeCallback) return callback = callback(children), invokeCallback = "" === nameSoFar ? "." + getElementKey(children, 0) : nameSoFar, isArrayImpl(callback) ? (escapedPrefix = "", null != invokeCallback && (escapedPrefix = invokeCallback.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
			return c;
		})) : null != callback && (isValidElement(callback) && (callback = cloneAndReplaceKey(callback, escapedPrefix + (null == callback.key || children && children.key === callback.key ? "" : ("" + callback.key).replace(userProvidedKeyEscapeRegex, "$&/") + "/") + invokeCallback)), array.push(callback)), 1;
		invokeCallback = 0;
		var nextNamePrefix = "" === nameSoFar ? "." : nameSoFar + ":";
		if (isArrayImpl(children)) for (var i = 0; i < children.length; i++) nameSoFar = children[i], type = nextNamePrefix + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(nameSoFar, array, escapedPrefix, type, callback);
		else if (i = getIteratorFn(children), "function" === typeof i) for (children = i.call(children), i = 0; !(nameSoFar = children.next()).done;) nameSoFar = nameSoFar.value, type = nextNamePrefix + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(nameSoFar, array, escapedPrefix, type, callback);
		else if ("object" === type) {
			if ("function" === typeof children.then) return mapIntoArray(resolveThenable(children), array, escapedPrefix, nameSoFar, callback);
			array = String(children);
			throw Error("Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead.");
		}
		return invokeCallback;
	}
	function mapChildren(children, func, context) {
		if (null == children) return children;
		var result = [], count = 0;
		mapIntoArray(children, result, "", "", function(child) {
			return func.call(context, child, count++);
		});
		return result;
	}
	function lazyInitializer(payload) {
		if (-1 === payload._status) {
			var ctor = payload._result;
			ctor = ctor();
			ctor.then(function(moduleObject) {
				if (0 === payload._status || -1 === payload._status) payload._status = 1, payload._result = moduleObject;
			}, function(error) {
				if (0 === payload._status || -1 === payload._status) payload._status = 2, payload._result = error;
			});
			-1 === payload._status && (payload._status = 0, payload._result = ctor);
		}
		if (1 === payload._status) return payload._result.default;
		throw payload._result;
	}
	var reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
		if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
			var event = new window.ErrorEvent("error", {
				bubbles: !0,
				cancelable: !0,
				message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
				error
			});
			if (!window.dispatchEvent(event)) return;
		} else if ("object" === typeof process && "function" === typeof process.emit) {
			process.emit("uncaughtException", error);
			return;
		}
		console.error(error);
	}, Children = {
		map: mapChildren,
		forEach: function(children, forEachFunc, forEachContext) {
			mapChildren(children, function() {
				forEachFunc.apply(this, arguments);
			}, forEachContext);
		},
		count: function(children) {
			var n = 0;
			mapChildren(children, function() {
				n++;
			});
			return n;
		},
		toArray: function(children) {
			return mapChildren(children, function(child) {
				return child;
			}) || [];
		},
		only: function(children) {
			if (!isValidElement(children)) throw Error("React.Children.only expected to receive a single React element child.");
			return children;
		}
	};
	exports.Activity = REACT_ACTIVITY_TYPE;
	exports.Children = Children;
	exports.Component = Component;
	exports.Fragment = REACT_FRAGMENT_TYPE;
	exports.Profiler = REACT_PROFILER_TYPE;
	exports.PureComponent = PureComponent;
	exports.StrictMode = REACT_STRICT_MODE_TYPE;
	exports.Suspense = REACT_SUSPENSE_TYPE;
	exports.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
	exports.__COMPILER_RUNTIME = {
		__proto__: null,
		c: function(size) {
			return ReactSharedInternals.H.useMemoCache(size);
		}
	};
	exports.cache = function(fn) {
		return function() {
			return fn.apply(null, arguments);
		};
	};
	exports.cacheSignal = function() {
		return null;
	};
	exports.cloneElement = function(element, config, children) {
		if (null === element || void 0 === element) throw Error("The argument must be a React element, but you passed " + element + ".");
		var props = assign({}, element.props), key = element.key;
		if (null != config) for (propName in void 0 !== config.key && (key = "" + config.key), config) !hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
		var propName = arguments.length - 2;
		if (1 === propName) props.children = children;
		else if (1 < propName) {
			for (var childArray = Array(propName), i = 0; i < propName; i++) childArray[i] = arguments[i + 2];
			props.children = childArray;
		}
		return ReactElement(element.type, key, props);
	};
	exports.createContext = function(defaultValue) {
		defaultValue = {
			$$typeof: REACT_CONTEXT_TYPE,
			_currentValue: defaultValue,
			_currentValue2: defaultValue,
			_threadCount: 0,
			Provider: null,
			Consumer: null
		};
		defaultValue.Provider = defaultValue;
		defaultValue.Consumer = {
			$$typeof: REACT_CONSUMER_TYPE,
			_context: defaultValue
		};
		return defaultValue;
	};
	exports.createElement = function(type, config, children) {
		var propName, props = {}, key = null;
		if (null != config) for (propName in void 0 !== config.key && (key = "" + config.key), config) hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (props[propName] = config[propName]);
		var childrenLength = arguments.length - 2;
		if (1 === childrenLength) props.children = children;
		else if (1 < childrenLength) {
			for (var childArray = Array(childrenLength), i = 0; i < childrenLength; i++) childArray[i] = arguments[i + 2];
			props.children = childArray;
		}
		if (type && type.defaultProps) for (propName in childrenLength = type.defaultProps, childrenLength) void 0 === props[propName] && (props[propName] = childrenLength[propName]);
		return ReactElement(type, key, props);
	};
	exports.createRef = function() {
		return { current: null };
	};
	exports.forwardRef = function(render) {
		return {
			$$typeof: REACT_FORWARD_REF_TYPE,
			render
		};
	};
	exports.isValidElement = isValidElement;
	exports.lazy = function(ctor) {
		return {
			$$typeof: REACT_LAZY_TYPE,
			_payload: {
				_status: -1,
				_result: ctor
			},
			_init: lazyInitializer
		};
	};
	exports.memo = function(type, compare) {
		return {
			$$typeof: REACT_MEMO_TYPE,
			type,
			compare: void 0 === compare ? null : compare
		};
	};
	exports.startTransition = function(scope) {
		var prevTransition = ReactSharedInternals.T, currentTransition = {};
		ReactSharedInternals.T = currentTransition;
		try {
			var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
			null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
			"object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && returnValue.then(noop, reportGlobalError);
		} catch (error) {
			reportGlobalError(error);
		} finally {
			null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
		}
	};
	exports.unstable_useCacheRefresh = function() {
		return ReactSharedInternals.H.useCacheRefresh();
	};
	exports.use = function(usable) {
		return ReactSharedInternals.H.use(usable);
	};
	exports.useActionState = function(action, initialState, permalink) {
		return ReactSharedInternals.H.useActionState(action, initialState, permalink);
	};
	exports.useCallback = function(callback, deps) {
		return ReactSharedInternals.H.useCallback(callback, deps);
	};
	exports.useContext = function(Context) {
		return ReactSharedInternals.H.useContext(Context);
	};
	exports.useDebugValue = function() {};
	exports.useDeferredValue = function(value, initialValue) {
		return ReactSharedInternals.H.useDeferredValue(value, initialValue);
	};
	exports.useEffect = function(create, deps) {
		return ReactSharedInternals.H.useEffect(create, deps);
	};
	exports.useEffectEvent = function(callback) {
		return ReactSharedInternals.H.useEffectEvent(callback);
	};
	exports.useId = function() {
		return ReactSharedInternals.H.useId();
	};
	exports.useImperativeHandle = function(ref, create, deps) {
		return ReactSharedInternals.H.useImperativeHandle(ref, create, deps);
	};
	exports.useInsertionEffect = function(create, deps) {
		return ReactSharedInternals.H.useInsertionEffect(create, deps);
	};
	exports.useLayoutEffect = function(create, deps) {
		return ReactSharedInternals.H.useLayoutEffect(create, deps);
	};
	exports.useMemo = function(create, deps) {
		return ReactSharedInternals.H.useMemo(create, deps);
	};
	exports.useOptimistic = function(passthrough, reducer) {
		return ReactSharedInternals.H.useOptimistic(passthrough, reducer);
	};
	exports.useReducer = function(reducer, initialArg, init) {
		return ReactSharedInternals.H.useReducer(reducer, initialArg, init);
	};
	exports.useRef = function(initialValue) {
		return ReactSharedInternals.H.useRef(initialValue);
	};
	exports.useState = function(initialState) {
		return ReactSharedInternals.H.useState(initialState);
	};
	exports.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
		return ReactSharedInternals.H.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
	};
	exports.useTransition = function() {
		return ReactSharedInternals.H.useTransition();
	};
	exports.version = "19.2.6";
}));
//#endregion
//#region ../../node_modules/.pnpm/react@19.2.6/node_modules/react/index.js
var require_react = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_react_production();
}));
//#endregion
//#region ../../node_modules/.pnpm/scheduler@0.27.0/node_modules/scheduler/cjs/scheduler.production.js
/**
* @license React
* scheduler.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_scheduler_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	function push(heap, node) {
		var index = heap.length;
		heap.push(node);
		a: for (; 0 < index;) {
			var parentIndex = index - 1 >>> 1, parent = heap[parentIndex];
			if (0 < compare(parent, node)) heap[parentIndex] = node, heap[index] = parent, index = parentIndex;
			else break a;
		}
	}
	function peek(heap) {
		return 0 === heap.length ? null : heap[0];
	}
	function pop(heap) {
		if (0 === heap.length) return null;
		var first = heap[0], last = heap.pop();
		if (last !== first) {
			heap[0] = last;
			a: for (var index = 0, length = heap.length, halfLength = length >>> 1; index < halfLength;) {
				var leftIndex = 2 * (index + 1) - 1, left = heap[leftIndex], rightIndex = leftIndex + 1, right = heap[rightIndex];
				if (0 > compare(left, last)) rightIndex < length && 0 > compare(right, left) ? (heap[index] = right, heap[rightIndex] = last, index = rightIndex) : (heap[index] = left, heap[leftIndex] = last, index = leftIndex);
				else if (rightIndex < length && 0 > compare(right, last)) heap[index] = right, heap[rightIndex] = last, index = rightIndex;
				else break a;
			}
		}
		return first;
	}
	function compare(a, b) {
		var diff = a.sortIndex - b.sortIndex;
		return 0 !== diff ? diff : a.id - b.id;
	}
	exports.unstable_now = void 0;
	if ("object" === typeof performance && "function" === typeof performance.now) {
		var localPerformance = performance;
		exports.unstable_now = function() {
			return localPerformance.now();
		};
	} else {
		var localDate = Date, initialTime = localDate.now();
		exports.unstable_now = function() {
			return localDate.now() - initialTime;
		};
	}
	var taskQueue = [], timerQueue = [], taskIdCounter = 1, currentTask = null, currentPriorityLevel = 3, isPerformingWork = !1, isHostCallbackScheduled = !1, isHostTimeoutScheduled = !1, needsPaint = !1, localSetTimeout = "function" === typeof setTimeout ? setTimeout : null, localClearTimeout = "function" === typeof clearTimeout ? clearTimeout : null, localSetImmediate = "undefined" !== typeof setImmediate ? setImmediate : null;
	function advanceTimers(currentTime) {
		for (var timer = peek(timerQueue); null !== timer;) {
			if (null === timer.callback) pop(timerQueue);
			else if (timer.startTime <= currentTime) pop(timerQueue), timer.sortIndex = timer.expirationTime, push(taskQueue, timer);
			else break;
			timer = peek(timerQueue);
		}
	}
	function handleTimeout(currentTime) {
		isHostTimeoutScheduled = !1;
		advanceTimers(currentTime);
		if (!isHostCallbackScheduled) if (null !== peek(taskQueue)) isHostCallbackScheduled = !0, isMessageLoopRunning || (isMessageLoopRunning = !0, schedulePerformWorkUntilDeadline());
		else {
			var firstTimer = peek(timerQueue);
			null !== firstTimer && requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
		}
	}
	var isMessageLoopRunning = !1, taskTimeoutID = -1, frameInterval = 5, startTime = -1;
	function shouldYieldToHost() {
		return needsPaint ? !0 : exports.unstable_now() - startTime < frameInterval ? !1 : !0;
	}
	function performWorkUntilDeadline() {
		needsPaint = !1;
		if (isMessageLoopRunning) {
			var currentTime = exports.unstable_now();
			startTime = currentTime;
			var hasMoreWork = !0;
			try {
				a: {
					isHostCallbackScheduled = !1;
					isHostTimeoutScheduled && (isHostTimeoutScheduled = !1, localClearTimeout(taskTimeoutID), taskTimeoutID = -1);
					isPerformingWork = !0;
					var previousPriorityLevel = currentPriorityLevel;
					try {
						b: {
							advanceTimers(currentTime);
							for (currentTask = peek(taskQueue); null !== currentTask && !(currentTask.expirationTime > currentTime && shouldYieldToHost());) {
								var callback = currentTask.callback;
								if ("function" === typeof callback) {
									currentTask.callback = null;
									currentPriorityLevel = currentTask.priorityLevel;
									var continuationCallback = callback(currentTask.expirationTime <= currentTime);
									currentTime = exports.unstable_now();
									if ("function" === typeof continuationCallback) {
										currentTask.callback = continuationCallback;
										advanceTimers(currentTime);
										hasMoreWork = !0;
										break b;
									}
									currentTask === peek(taskQueue) && pop(taskQueue);
									advanceTimers(currentTime);
								} else pop(taskQueue);
								currentTask = peek(taskQueue);
							}
							if (null !== currentTask) hasMoreWork = !0;
							else {
								var firstTimer = peek(timerQueue);
								null !== firstTimer && requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
								hasMoreWork = !1;
							}
						}
						break a;
					} finally {
						currentTask = null, currentPriorityLevel = previousPriorityLevel, isPerformingWork = !1;
					}
					hasMoreWork = void 0;
				}
			} finally {
				hasMoreWork ? schedulePerformWorkUntilDeadline() : isMessageLoopRunning = !1;
			}
		}
	}
	var schedulePerformWorkUntilDeadline;
	if ("function" === typeof localSetImmediate) schedulePerformWorkUntilDeadline = function() {
		localSetImmediate(performWorkUntilDeadline);
	};
	else if ("undefined" !== typeof MessageChannel) {
		var channel = new MessageChannel(), port = channel.port2;
		channel.port1.onmessage = performWorkUntilDeadline;
		schedulePerformWorkUntilDeadline = function() {
			port.postMessage(null);
		};
	} else schedulePerformWorkUntilDeadline = function() {
		localSetTimeout(performWorkUntilDeadline, 0);
	};
	function requestHostTimeout(callback, ms) {
		taskTimeoutID = localSetTimeout(function() {
			callback(exports.unstable_now());
		}, ms);
	}
	exports.unstable_IdlePriority = 5;
	exports.unstable_ImmediatePriority = 1;
	exports.unstable_LowPriority = 4;
	exports.unstable_NormalPriority = 3;
	exports.unstable_Profiling = null;
	exports.unstable_UserBlockingPriority = 2;
	exports.unstable_cancelCallback = function(task) {
		task.callback = null;
	};
	exports.unstable_forceFrameRate = function(fps) {
		0 > fps || 125 < fps ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : frameInterval = 0 < fps ? Math.floor(1e3 / fps) : 5;
	};
	exports.unstable_getCurrentPriorityLevel = function() {
		return currentPriorityLevel;
	};
	exports.unstable_next = function(eventHandler) {
		switch (currentPriorityLevel) {
			case 1:
			case 2:
			case 3:
				var priorityLevel = 3;
				break;
			default: priorityLevel = currentPriorityLevel;
		}
		var previousPriorityLevel = currentPriorityLevel;
		currentPriorityLevel = priorityLevel;
		try {
			return eventHandler();
		} finally {
			currentPriorityLevel = previousPriorityLevel;
		}
	};
	exports.unstable_requestPaint = function() {
		needsPaint = !0;
	};
	exports.unstable_runWithPriority = function(priorityLevel, eventHandler) {
		switch (priorityLevel) {
			case 1:
			case 2:
			case 3:
			case 4:
			case 5: break;
			default: priorityLevel = 3;
		}
		var previousPriorityLevel = currentPriorityLevel;
		currentPriorityLevel = priorityLevel;
		try {
			return eventHandler();
		} finally {
			currentPriorityLevel = previousPriorityLevel;
		}
	};
	exports.unstable_scheduleCallback = function(priorityLevel, callback, options) {
		var currentTime = exports.unstable_now();
		"object" === typeof options && null !== options ? (options = options.delay, options = "number" === typeof options && 0 < options ? currentTime + options : currentTime) : options = currentTime;
		switch (priorityLevel) {
			case 1:
				var timeout = -1;
				break;
			case 2:
				timeout = 250;
				break;
			case 5:
				timeout = 1073741823;
				break;
			case 4:
				timeout = 1e4;
				break;
			default: timeout = 5e3;
		}
		timeout = options + timeout;
		priorityLevel = {
			id: taskIdCounter++,
			callback,
			priorityLevel,
			startTime: options,
			expirationTime: timeout,
			sortIndex: -1
		};
		options > currentTime ? (priorityLevel.sortIndex = options, push(timerQueue, priorityLevel), null === peek(taskQueue) && priorityLevel === peek(timerQueue) && (isHostTimeoutScheduled ? (localClearTimeout(taskTimeoutID), taskTimeoutID = -1) : isHostTimeoutScheduled = !0, requestHostTimeout(handleTimeout, options - currentTime))) : (priorityLevel.sortIndex = timeout, push(taskQueue, priorityLevel), isHostCallbackScheduled || isPerformingWork || (isHostCallbackScheduled = !0, isMessageLoopRunning || (isMessageLoopRunning = !0, schedulePerformWorkUntilDeadline())));
		return priorityLevel;
	};
	exports.unstable_shouldYield = shouldYieldToHost;
	exports.unstable_wrapCallback = function(callback) {
		var parentPriorityLevel = currentPriorityLevel;
		return function() {
			var previousPriorityLevel = currentPriorityLevel;
			currentPriorityLevel = parentPriorityLevel;
			try {
				return callback.apply(this, arguments);
			} finally {
				currentPriorityLevel = previousPriorityLevel;
			}
		};
	};
}));
//#endregion
//#region ../../node_modules/.pnpm/scheduler@0.27.0/node_modules/scheduler/index.js
var require_scheduler = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_scheduler_production();
}));
//#endregion
//#region ../../node_modules/.pnpm/react-dom@19.2.6_react@19.2.6/node_modules/react-dom/cjs/react-dom.production.js
/**
* @license React
* react-dom.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_dom_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var React = require_react();
	function formatProdErrorMessage(code) {
		var url = "https://react.dev/errors/" + code;
		if (1 < arguments.length) {
			url += "?args[]=" + encodeURIComponent(arguments[1]);
			for (var i = 2; i < arguments.length; i++) url += "&args[]=" + encodeURIComponent(arguments[i]);
		}
		return "Minified React error #" + code + "; visit " + url + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
	}
	function noop() {}
	var Internals = {
		d: {
			f: noop,
			r: function() {
				throw Error(formatProdErrorMessage(522));
			},
			D: noop,
			C: noop,
			L: noop,
			m: noop,
			X: noop,
			S: noop,
			M: noop
		},
		p: 0,
		findDOMNode: null
	}, REACT_PORTAL_TYPE = Symbol.for("react.portal");
	function createPortal$1(children, containerInfo, implementation) {
		var key = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : null;
		return {
			$$typeof: REACT_PORTAL_TYPE,
			key: null == key ? null : "" + key,
			children,
			containerInfo,
			implementation
		};
	}
	var ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
	function getCrossOriginStringAs(as, input) {
		if ("font" === as) return "";
		if ("string" === typeof input) return "use-credentials" === input ? input : "";
	}
	exports.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = Internals;
	exports.createPortal = function(children, container) {
		var key = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : null;
		if (!container || 1 !== container.nodeType && 9 !== container.nodeType && 11 !== container.nodeType) throw Error(formatProdErrorMessage(299));
		return createPortal$1(children, container, null, key);
	};
	exports.flushSync = function(fn) {
		var previousTransition = ReactSharedInternals.T, previousUpdatePriority = Internals.p;
		try {
			if (ReactSharedInternals.T = null, Internals.p = 2, fn) return fn();
		} finally {
			ReactSharedInternals.T = previousTransition, Internals.p = previousUpdatePriority, Internals.d.f();
		}
	};
	exports.preconnect = function(href, options) {
		"string" === typeof href && (options ? (options = options.crossOrigin, options = "string" === typeof options ? "use-credentials" === options ? options : "" : void 0) : options = null, Internals.d.C(href, options));
	};
	exports.prefetchDNS = function(href) {
		"string" === typeof href && Internals.d.D(href);
	};
	exports.preinit = function(href, options) {
		if ("string" === typeof href && options && "string" === typeof options.as) {
			var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin), integrity = "string" === typeof options.integrity ? options.integrity : void 0, fetchPriority = "string" === typeof options.fetchPriority ? options.fetchPriority : void 0;
			"style" === as ? Internals.d.S(href, "string" === typeof options.precedence ? options.precedence : void 0, {
				crossOrigin,
				integrity,
				fetchPriority
			}) : "script" === as && Internals.d.X(href, {
				crossOrigin,
				integrity,
				fetchPriority,
				nonce: "string" === typeof options.nonce ? options.nonce : void 0
			});
		}
	};
	exports.preinitModule = function(href, options) {
		if ("string" === typeof href) if ("object" === typeof options && null !== options) {
			if (null == options.as || "script" === options.as) {
				var crossOrigin = getCrossOriginStringAs(options.as, options.crossOrigin);
				Internals.d.M(href, {
					crossOrigin,
					integrity: "string" === typeof options.integrity ? options.integrity : void 0,
					nonce: "string" === typeof options.nonce ? options.nonce : void 0
				});
			}
		} else options ?? Internals.d.M(href);
	};
	exports.preload = function(href, options) {
		if ("string" === typeof href && "object" === typeof options && null !== options && "string" === typeof options.as) {
			var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin);
			Internals.d.L(href, as, {
				crossOrigin,
				integrity: "string" === typeof options.integrity ? options.integrity : void 0,
				nonce: "string" === typeof options.nonce ? options.nonce : void 0,
				type: "string" === typeof options.type ? options.type : void 0,
				fetchPriority: "string" === typeof options.fetchPriority ? options.fetchPriority : void 0,
				referrerPolicy: "string" === typeof options.referrerPolicy ? options.referrerPolicy : void 0,
				imageSrcSet: "string" === typeof options.imageSrcSet ? options.imageSrcSet : void 0,
				imageSizes: "string" === typeof options.imageSizes ? options.imageSizes : void 0,
				media: "string" === typeof options.media ? options.media : void 0
			});
		}
	};
	exports.preloadModule = function(href, options) {
		if ("string" === typeof href) if (options) {
			var crossOrigin = getCrossOriginStringAs(options.as, options.crossOrigin);
			Internals.d.m(href, {
				as: "string" === typeof options.as && "script" !== options.as ? options.as : void 0,
				crossOrigin,
				integrity: "string" === typeof options.integrity ? options.integrity : void 0
			});
		} else Internals.d.m(href);
	};
	exports.requestFormReset = function(form) {
		Internals.d.r(form);
	};
	exports.unstable_batchedUpdates = function(fn, a) {
		return fn(a);
	};
	exports.useFormState = function(action, initialState, permalink) {
		return ReactSharedInternals.H.useFormState(action, initialState, permalink);
	};
	exports.useFormStatus = function() {
		return ReactSharedInternals.H.useHostTransitionStatus();
	};
	exports.version = "19.2.6";
}));
//#endregion
//#region ../../node_modules/.pnpm/react-dom@19.2.6_react@19.2.6/node_modules/react-dom/index.js
var require_react_dom = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function checkDCE() {
		if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== "function") return;
		try {
			__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
		} catch (err) {
			console.error(err);
		}
	}
	checkDCE();
	module.exports = require_react_dom_production();
}));
//#endregion
//#region ../../node_modules/.pnpm/react-dom@19.2.6_react@19.2.6/node_modules/react-dom/cjs/react-dom-client.production.js
/**
* @license React
* react-dom-client.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_dom_client_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var Scheduler = require_scheduler(), React = require_react(), ReactDOM = require_react_dom();
	function formatProdErrorMessage(code) {
		var url = "https://react.dev/errors/" + code;
		if (1 < arguments.length) {
			url += "?args[]=" + encodeURIComponent(arguments[1]);
			for (var i = 2; i < arguments.length; i++) url += "&args[]=" + encodeURIComponent(arguments[i]);
		}
		return "Minified React error #" + code + "; visit " + url + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
	}
	function isValidContainer(node) {
		return !(!node || 1 !== node.nodeType && 9 !== node.nodeType && 11 !== node.nodeType);
	}
	function getNearestMountedFiber(fiber) {
		var node = fiber, nearestMounted = fiber;
		if (fiber.alternate) for (; node.return;) node = node.return;
		else {
			fiber = node;
			do
				node = fiber, 0 !== (node.flags & 4098) && (nearestMounted = node.return), fiber = node.return;
			while (fiber);
		}
		return 3 === node.tag ? nearestMounted : null;
	}
	function getSuspenseInstanceFromFiber(fiber) {
		if (13 === fiber.tag) {
			var suspenseState = fiber.memoizedState;
			null === suspenseState && (fiber = fiber.alternate, null !== fiber && (suspenseState = fiber.memoizedState));
			if (null !== suspenseState) return suspenseState.dehydrated;
		}
		return null;
	}
	function getActivityInstanceFromFiber(fiber) {
		if (31 === fiber.tag) {
			var activityState = fiber.memoizedState;
			null === activityState && (fiber = fiber.alternate, null !== fiber && (activityState = fiber.memoizedState));
			if (null !== activityState) return activityState.dehydrated;
		}
		return null;
	}
	function assertIsMounted(fiber) {
		if (getNearestMountedFiber(fiber) !== fiber) throw Error(formatProdErrorMessage(188));
	}
	function findCurrentFiberUsingSlowPath(fiber) {
		var alternate = fiber.alternate;
		if (!alternate) {
			alternate = getNearestMountedFiber(fiber);
			if (null === alternate) throw Error(formatProdErrorMessage(188));
			return alternate !== fiber ? null : fiber;
		}
		for (var a = fiber, b = alternate;;) {
			var parentA = a.return;
			if (null === parentA) break;
			var parentB = parentA.alternate;
			if (null === parentB) {
				b = parentA.return;
				if (null !== b) {
					a = b;
					continue;
				}
				break;
			}
			if (parentA.child === parentB.child) {
				for (parentB = parentA.child; parentB;) {
					if (parentB === a) return assertIsMounted(parentA), fiber;
					if (parentB === b) return assertIsMounted(parentA), alternate;
					parentB = parentB.sibling;
				}
				throw Error(formatProdErrorMessage(188));
			}
			if (a.return !== b.return) a = parentA, b = parentB;
			else {
				for (var didFindChild = !1, child$0 = parentA.child; child$0;) {
					if (child$0 === a) {
						didFindChild = !0;
						a = parentA;
						b = parentB;
						break;
					}
					if (child$0 === b) {
						didFindChild = !0;
						b = parentA;
						a = parentB;
						break;
					}
					child$0 = child$0.sibling;
				}
				if (!didFindChild) {
					for (child$0 = parentB.child; child$0;) {
						if (child$0 === a) {
							didFindChild = !0;
							a = parentB;
							b = parentA;
							break;
						}
						if (child$0 === b) {
							didFindChild = !0;
							b = parentB;
							a = parentA;
							break;
						}
						child$0 = child$0.sibling;
					}
					if (!didFindChild) throw Error(formatProdErrorMessage(189));
				}
			}
			if (a.alternate !== b) throw Error(formatProdErrorMessage(190));
		}
		if (3 !== a.tag) throw Error(formatProdErrorMessage(188));
		return a.stateNode.current === a ? fiber : alternate;
	}
	function findCurrentHostFiberImpl(node) {
		var tag = node.tag;
		if (5 === tag || 26 === tag || 27 === tag || 6 === tag) return node;
		for (node = node.child; null !== node;) {
			tag = findCurrentHostFiberImpl(node);
			if (null !== tag) return tag;
			node = node.sibling;
		}
		return null;
	}
	var assign = Object.assign, REACT_LEGACY_ELEMENT_TYPE = Symbol.for("react.element"), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy");
	var REACT_ACTIVITY_TYPE = Symbol.for("react.activity");
	var REACT_MEMO_CACHE_SENTINEL = Symbol.for("react.memo_cache_sentinel");
	var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
	function getIteratorFn(maybeIterable) {
		if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
		maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
		return "function" === typeof maybeIterable ? maybeIterable : null;
	}
	var REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference");
	function getComponentNameFromType(type) {
		if (null == type) return null;
		if ("function" === typeof type) return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
		if ("string" === typeof type) return type;
		switch (type) {
			case REACT_FRAGMENT_TYPE: return "Fragment";
			case REACT_PROFILER_TYPE: return "Profiler";
			case REACT_STRICT_MODE_TYPE: return "StrictMode";
			case REACT_SUSPENSE_TYPE: return "Suspense";
			case REACT_SUSPENSE_LIST_TYPE: return "SuspenseList";
			case REACT_ACTIVITY_TYPE: return "Activity";
		}
		if ("object" === typeof type) switch (type.$$typeof) {
			case REACT_PORTAL_TYPE: return "Portal";
			case REACT_CONTEXT_TYPE: return type.displayName || "Context";
			case REACT_CONSUMER_TYPE: return (type._context.displayName || "Context") + ".Consumer";
			case REACT_FORWARD_REF_TYPE:
				var innerType = type.render;
				type = type.displayName;
				type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
				return type;
			case REACT_MEMO_TYPE: return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
			case REACT_LAZY_TYPE:
				innerType = type._payload;
				type = type._init;
				try {
					return getComponentNameFromType(type(innerType));
				} catch (x) {}
		}
		return null;
	}
	var isArrayImpl = Array.isArray, ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, ReactDOMSharedInternals = ReactDOM.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, sharedNotPendingObject = {
		pending: !1,
		data: null,
		method: null,
		action: null
	}, valueStack = [], index = -1;
	function createCursor(defaultValue) {
		return { current: defaultValue };
	}
	function pop(cursor) {
		0 > index || (cursor.current = valueStack[index], valueStack[index] = null, index--);
	}
	function push(cursor, value) {
		index++;
		valueStack[index] = cursor.current;
		cursor.current = value;
	}
	var contextStackCursor = createCursor(null), contextFiberStackCursor = createCursor(null), rootInstanceStackCursor = createCursor(null), hostTransitionProviderCursor = createCursor(null);
	function pushHostContainer(fiber, nextRootInstance) {
		push(rootInstanceStackCursor, nextRootInstance);
		push(contextFiberStackCursor, fiber);
		push(contextStackCursor, null);
		switch (nextRootInstance.nodeType) {
			case 9:
			case 11:
				fiber = (fiber = nextRootInstance.documentElement) ? (fiber = fiber.namespaceURI) ? getOwnHostContext(fiber) : 0 : 0;
				break;
			default: if (fiber = nextRootInstance.tagName, nextRootInstance = nextRootInstance.namespaceURI) nextRootInstance = getOwnHostContext(nextRootInstance), fiber = getChildHostContextProd(nextRootInstance, fiber);
			else switch (fiber) {
				case "svg":
					fiber = 1;
					break;
				case "math":
					fiber = 2;
					break;
				default: fiber = 0;
			}
		}
		pop(contextStackCursor);
		push(contextStackCursor, fiber);
	}
	function popHostContainer() {
		pop(contextStackCursor);
		pop(contextFiberStackCursor);
		pop(rootInstanceStackCursor);
	}
	function pushHostContext(fiber) {
		null !== fiber.memoizedState && push(hostTransitionProviderCursor, fiber);
		var context = contextStackCursor.current;
		var JSCompiler_inline_result = getChildHostContextProd(context, fiber.type);
		context !== JSCompiler_inline_result && (push(contextFiberStackCursor, fiber), push(contextStackCursor, JSCompiler_inline_result));
	}
	function popHostContext(fiber) {
		contextFiberStackCursor.current === fiber && (pop(contextStackCursor), pop(contextFiberStackCursor));
		hostTransitionProviderCursor.current === fiber && (pop(hostTransitionProviderCursor), HostTransitionContext._currentValue = sharedNotPendingObject);
	}
	var prefix, suffix;
	function describeBuiltInComponentFrame(name) {
		if (void 0 === prefix) try {
			throw Error();
		} catch (x) {
			var match = x.stack.trim().match(/\n( *(at )?)/);
			prefix = match && match[1] || "";
			suffix = -1 < x.stack.indexOf("\n    at") ? " (<anonymous>)" : -1 < x.stack.indexOf("@") ? "@unknown:0:0" : "";
		}
		return "\n" + prefix + name + suffix;
	}
	var reentry = !1;
	function describeNativeComponentFrame(fn, construct) {
		if (!fn || reentry) return "";
		reentry = !0;
		var previousPrepareStackTrace = Error.prepareStackTrace;
		Error.prepareStackTrace = void 0;
		try {
			var RunInRootFrame = { DetermineComponentFrameRoot: function() {
				try {
					if (construct) {
						var Fake = function() {
							throw Error();
						};
						Object.defineProperty(Fake.prototype, "props", { set: function() {
							throw Error();
						} });
						if ("object" === typeof Reflect && Reflect.construct) {
							try {
								Reflect.construct(Fake, []);
							} catch (x) {
								var control = x;
							}
							Reflect.construct(fn, [], Fake);
						} else {
							try {
								Fake.call();
							} catch (x$1) {
								control = x$1;
							}
							fn.call(Fake.prototype);
						}
					} else {
						try {
							throw Error();
						} catch (x$2) {
							control = x$2;
						}
						(Fake = fn()) && "function" === typeof Fake.catch && Fake.catch(function() {});
					}
				} catch (sample) {
					if (sample && control && "string" === typeof sample.stack) return [sample.stack, control.stack];
				}
				return [null, null];
			} };
			RunInRootFrame.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
			var namePropDescriptor = Object.getOwnPropertyDescriptor(RunInRootFrame.DetermineComponentFrameRoot, "name");
			namePropDescriptor && namePropDescriptor.configurable && Object.defineProperty(RunInRootFrame.DetermineComponentFrameRoot, "name", { value: "DetermineComponentFrameRoot" });
			var _RunInRootFrame$Deter = RunInRootFrame.DetermineComponentFrameRoot(), sampleStack = _RunInRootFrame$Deter[0], controlStack = _RunInRootFrame$Deter[1];
			if (sampleStack && controlStack) {
				var sampleLines = sampleStack.split("\n"), controlLines = controlStack.split("\n");
				for (namePropDescriptor = RunInRootFrame = 0; RunInRootFrame < sampleLines.length && !sampleLines[RunInRootFrame].includes("DetermineComponentFrameRoot");) RunInRootFrame++;
				for (; namePropDescriptor < controlLines.length && !controlLines[namePropDescriptor].includes("DetermineComponentFrameRoot");) namePropDescriptor++;
				if (RunInRootFrame === sampleLines.length || namePropDescriptor === controlLines.length) for (RunInRootFrame = sampleLines.length - 1, namePropDescriptor = controlLines.length - 1; 1 <= RunInRootFrame && 0 <= namePropDescriptor && sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor];) namePropDescriptor--;
				for (; 1 <= RunInRootFrame && 0 <= namePropDescriptor; RunInRootFrame--, namePropDescriptor--) if (sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]) {
					if (1 !== RunInRootFrame || 1 !== namePropDescriptor) do
						if (RunInRootFrame--, namePropDescriptor--, 0 > namePropDescriptor || sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]) {
							var frame = "\n" + sampleLines[RunInRootFrame].replace(" at new ", " at ");
							fn.displayName && frame.includes("<anonymous>") && (frame = frame.replace("<anonymous>", fn.displayName));
							return frame;
						}
					while (1 <= RunInRootFrame && 0 <= namePropDescriptor);
					break;
				}
			}
		} finally {
			reentry = !1, Error.prepareStackTrace = previousPrepareStackTrace;
		}
		return (previousPrepareStackTrace = fn ? fn.displayName || fn.name : "") ? describeBuiltInComponentFrame(previousPrepareStackTrace) : "";
	}
	function describeFiber(fiber, childFiber) {
		switch (fiber.tag) {
			case 26:
			case 27:
			case 5: return describeBuiltInComponentFrame(fiber.type);
			case 16: return describeBuiltInComponentFrame("Lazy");
			case 13: return fiber.child !== childFiber && null !== childFiber ? describeBuiltInComponentFrame("Suspense Fallback") : describeBuiltInComponentFrame("Suspense");
			case 19: return describeBuiltInComponentFrame("SuspenseList");
			case 0:
			case 15: return describeNativeComponentFrame(fiber.type, !1);
			case 11: return describeNativeComponentFrame(fiber.type.render, !1);
			case 1: return describeNativeComponentFrame(fiber.type, !0);
			case 31: return describeBuiltInComponentFrame("Activity");
			default: return "";
		}
	}
	function getStackByFiberInDevAndProd(workInProgress) {
		try {
			var info = "", previous = null;
			do
				info += describeFiber(workInProgress, previous), previous = workInProgress, workInProgress = workInProgress.return;
			while (workInProgress);
			return info;
		} catch (x) {
			return "\nError generating stack: " + x.message + "\n" + x.stack;
		}
	}
	var hasOwnProperty = Object.prototype.hasOwnProperty, scheduleCallback$3 = Scheduler.unstable_scheduleCallback, cancelCallback$1 = Scheduler.unstable_cancelCallback, shouldYield = Scheduler.unstable_shouldYield, requestPaint = Scheduler.unstable_requestPaint, now = Scheduler.unstable_now, getCurrentPriorityLevel = Scheduler.unstable_getCurrentPriorityLevel, ImmediatePriority = Scheduler.unstable_ImmediatePriority, UserBlockingPriority = Scheduler.unstable_UserBlockingPriority, NormalPriority$1 = Scheduler.unstable_NormalPriority, LowPriority = Scheduler.unstable_LowPriority, IdlePriority = Scheduler.unstable_IdlePriority, log$1 = Scheduler.log, unstable_setDisableYieldValue = Scheduler.unstable_setDisableYieldValue, rendererID = null, injectedHook = null;
	function setIsStrictModeForDevtools(newIsStrictMode) {
		"function" === typeof log$1 && unstable_setDisableYieldValue(newIsStrictMode);
		if (injectedHook && "function" === typeof injectedHook.setStrictMode) try {
			injectedHook.setStrictMode(rendererID, newIsStrictMode);
		} catch (err) {}
	}
	var clz32 = Math.clz32 ? Math.clz32 : clz32Fallback, log = Math.log, LN2 = Math.LN2;
	function clz32Fallback(x) {
		x >>>= 0;
		return 0 === x ? 32 : 31 - (log(x) / LN2 | 0) | 0;
	}
	var nextTransitionUpdateLane = 256, nextTransitionDeferredLane = 262144, nextRetryLane = 4194304;
	function getHighestPriorityLanes(lanes) {
		var pendingSyncLanes = lanes & 42;
		if (0 !== pendingSyncLanes) return pendingSyncLanes;
		switch (lanes & -lanes) {
			case 1: return 1;
			case 2: return 2;
			case 4: return 4;
			case 8: return 8;
			case 16: return 16;
			case 32: return 32;
			case 64: return 64;
			case 128: return 128;
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072: return lanes & 261888;
			case 262144:
			case 524288:
			case 1048576:
			case 2097152: return lanes & 3932160;
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432: return lanes & 62914560;
			case 67108864: return 67108864;
			case 134217728: return 134217728;
			case 268435456: return 268435456;
			case 536870912: return 536870912;
			case 1073741824: return 0;
			default: return lanes;
		}
	}
	function getNextLanes(root, wipLanes, rootHasPendingCommit) {
		var pendingLanes = root.pendingLanes;
		if (0 === pendingLanes) return 0;
		var nextLanes = 0, suspendedLanes = root.suspendedLanes, pingedLanes = root.pingedLanes;
		root = root.warmLanes;
		var nonIdlePendingLanes = pendingLanes & 134217727;
		0 !== nonIdlePendingLanes ? (pendingLanes = nonIdlePendingLanes & ~suspendedLanes, 0 !== pendingLanes ? nextLanes = getHighestPriorityLanes(pendingLanes) : (pingedLanes &= nonIdlePendingLanes, 0 !== pingedLanes ? nextLanes = getHighestPriorityLanes(pingedLanes) : rootHasPendingCommit || (rootHasPendingCommit = nonIdlePendingLanes & ~root, 0 !== rootHasPendingCommit && (nextLanes = getHighestPriorityLanes(rootHasPendingCommit))))) : (nonIdlePendingLanes = pendingLanes & ~suspendedLanes, 0 !== nonIdlePendingLanes ? nextLanes = getHighestPriorityLanes(nonIdlePendingLanes) : 0 !== pingedLanes ? nextLanes = getHighestPriorityLanes(pingedLanes) : rootHasPendingCommit || (rootHasPendingCommit = pendingLanes & ~root, 0 !== rootHasPendingCommit && (nextLanes = getHighestPriorityLanes(rootHasPendingCommit))));
		return 0 === nextLanes ? 0 : 0 !== wipLanes && wipLanes !== nextLanes && 0 === (wipLanes & suspendedLanes) && (suspendedLanes = nextLanes & -nextLanes, rootHasPendingCommit = wipLanes & -wipLanes, suspendedLanes >= rootHasPendingCommit || 32 === suspendedLanes && 0 !== (rootHasPendingCommit & 4194048)) ? wipLanes : nextLanes;
	}
	function checkIfRootIsPrerendering(root, renderLanes) {
		return 0 === (root.pendingLanes & ~(root.suspendedLanes & ~root.pingedLanes) & renderLanes);
	}
	function computeExpirationTime(lane, currentTime) {
		switch (lane) {
			case 1:
			case 2:
			case 4:
			case 8:
			case 64: return currentTime + 250;
			case 16:
			case 32:
			case 128:
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072:
			case 262144:
			case 524288:
			case 1048576:
			case 2097152: return currentTime + 5e3;
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432: return -1;
			case 67108864:
			case 134217728:
			case 268435456:
			case 536870912:
			case 1073741824: return -1;
			default: return -1;
		}
	}
	function claimNextRetryLane() {
		var lane = nextRetryLane;
		nextRetryLane <<= 1;
		0 === (nextRetryLane & 62914560) && (nextRetryLane = 4194304);
		return lane;
	}
	function createLaneMap(initial) {
		for (var laneMap = [], i = 0; 31 > i; i++) laneMap.push(initial);
		return laneMap;
	}
	function markRootUpdated$1(root, updateLane) {
		root.pendingLanes |= updateLane;
		268435456 !== updateLane && (root.suspendedLanes = 0, root.pingedLanes = 0, root.warmLanes = 0);
	}
	function markRootFinished(root, finishedLanes, remainingLanes, spawnedLane, updatedLanes, suspendedRetryLanes) {
		var previouslyPendingLanes = root.pendingLanes;
		root.pendingLanes = remainingLanes;
		root.suspendedLanes = 0;
		root.pingedLanes = 0;
		root.warmLanes = 0;
		root.expiredLanes &= remainingLanes;
		root.entangledLanes &= remainingLanes;
		root.errorRecoveryDisabledLanes &= remainingLanes;
		root.shellSuspendCounter = 0;
		var entanglements = root.entanglements, expirationTimes = root.expirationTimes, hiddenUpdates = root.hiddenUpdates;
		for (remainingLanes = previouslyPendingLanes & ~remainingLanes; 0 < remainingLanes;) {
			var index$7 = 31 - clz32(remainingLanes), lane = 1 << index$7;
			entanglements[index$7] = 0;
			expirationTimes[index$7] = -1;
			var hiddenUpdatesForLane = hiddenUpdates[index$7];
			if (null !== hiddenUpdatesForLane) for (hiddenUpdates[index$7] = null, index$7 = 0; index$7 < hiddenUpdatesForLane.length; index$7++) {
				var update = hiddenUpdatesForLane[index$7];
				null !== update && (update.lane &= -536870913);
			}
			remainingLanes &= ~lane;
		}
		0 !== spawnedLane && markSpawnedDeferredLane(root, spawnedLane, 0);
		0 !== suspendedRetryLanes && 0 === updatedLanes && 0 !== root.tag && (root.suspendedLanes |= suspendedRetryLanes & ~(previouslyPendingLanes & ~finishedLanes));
	}
	function markSpawnedDeferredLane(root, spawnedLane, entangledLanes) {
		root.pendingLanes |= spawnedLane;
		root.suspendedLanes &= ~spawnedLane;
		var spawnedLaneIndex = 31 - clz32(spawnedLane);
		root.entangledLanes |= spawnedLane;
		root.entanglements[spawnedLaneIndex] = root.entanglements[spawnedLaneIndex] | 1073741824 | entangledLanes & 261930;
	}
	function markRootEntangled(root, entangledLanes) {
		var rootEntangledLanes = root.entangledLanes |= entangledLanes;
		for (root = root.entanglements; rootEntangledLanes;) {
			var index$8 = 31 - clz32(rootEntangledLanes), lane = 1 << index$8;
			lane & entangledLanes | root[index$8] & entangledLanes && (root[index$8] |= entangledLanes);
			rootEntangledLanes &= ~lane;
		}
	}
	function getBumpedLaneForHydration(root, renderLanes) {
		var renderLane = renderLanes & -renderLanes;
		renderLane = 0 !== (renderLane & 42) ? 1 : getBumpedLaneForHydrationByLane(renderLane);
		return 0 !== (renderLane & (root.suspendedLanes | renderLanes)) ? 0 : renderLane;
	}
	function getBumpedLaneForHydrationByLane(lane) {
		switch (lane) {
			case 2:
				lane = 1;
				break;
			case 8:
				lane = 4;
				break;
			case 32:
				lane = 16;
				break;
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072:
			case 262144:
			case 524288:
			case 1048576:
			case 2097152:
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432:
				lane = 128;
				break;
			case 268435456:
				lane = 134217728;
				break;
			default: lane = 0;
		}
		return lane;
	}
	function lanesToEventPriority(lanes) {
		lanes &= -lanes;
		return 2 < lanes ? 8 < lanes ? 0 !== (lanes & 134217727) ? 32 : 268435456 : 8 : 2;
	}
	function resolveUpdatePriority() {
		var updatePriority = ReactDOMSharedInternals.p;
		if (0 !== updatePriority) return updatePriority;
		updatePriority = window.event;
		return void 0 === updatePriority ? 32 : getEventPriority(updatePriority.type);
	}
	function runWithPriority(priority, fn) {
		var previousPriority = ReactDOMSharedInternals.p;
		try {
			return ReactDOMSharedInternals.p = priority, fn();
		} finally {
			ReactDOMSharedInternals.p = previousPriority;
		}
	}
	var randomKey = Math.random().toString(36).slice(2), internalInstanceKey = "__reactFiber$" + randomKey, internalPropsKey = "__reactProps$" + randomKey, internalContainerInstanceKey = "__reactContainer$" + randomKey, internalEventHandlersKey = "__reactEvents$" + randomKey, internalEventHandlerListenersKey = "__reactListeners$" + randomKey, internalEventHandlesSetKey = "__reactHandles$" + randomKey, internalRootNodeResourcesKey = "__reactResources$" + randomKey, internalHoistableMarker = "__reactMarker$" + randomKey;
	function detachDeletedInstance(node) {
		delete node[internalInstanceKey];
		delete node[internalPropsKey];
		delete node[internalEventHandlersKey];
		delete node[internalEventHandlerListenersKey];
		delete node[internalEventHandlesSetKey];
	}
	function getClosestInstanceFromNode(targetNode) {
		var targetInst = targetNode[internalInstanceKey];
		if (targetInst) return targetInst;
		for (var parentNode = targetNode.parentNode; parentNode;) {
			if (targetInst = parentNode[internalContainerInstanceKey] || parentNode[internalInstanceKey]) {
				parentNode = targetInst.alternate;
				if (null !== targetInst.child || null !== parentNode && null !== parentNode.child) for (targetNode = getParentHydrationBoundary(targetNode); null !== targetNode;) {
					if (parentNode = targetNode[internalInstanceKey]) return parentNode;
					targetNode = getParentHydrationBoundary(targetNode);
				}
				return targetInst;
			}
			targetNode = parentNode;
			parentNode = targetNode.parentNode;
		}
		return null;
	}
	function getInstanceFromNode(node) {
		if (node = node[internalInstanceKey] || node[internalContainerInstanceKey]) {
			var tag = node.tag;
			if (5 === tag || 6 === tag || 13 === tag || 31 === tag || 26 === tag || 27 === tag || 3 === tag) return node;
		}
		return null;
	}
	function getNodeFromInstance(inst) {
		var tag = inst.tag;
		if (5 === tag || 26 === tag || 27 === tag || 6 === tag) return inst.stateNode;
		throw Error(formatProdErrorMessage(33));
	}
	function getResourcesFromRoot(root) {
		var resources = root[internalRootNodeResourcesKey];
		resources || (resources = root[internalRootNodeResourcesKey] = {
			hoistableStyles: /* @__PURE__ */ new Map(),
			hoistableScripts: /* @__PURE__ */ new Map()
		});
		return resources;
	}
	function markNodeAsHoistable(node) {
		node[internalHoistableMarker] = !0;
	}
	var allNativeEvents = /* @__PURE__ */ new Set(), registrationNameDependencies = {};
	function registerTwoPhaseEvent(registrationName, dependencies) {
		registerDirectEvent(registrationName, dependencies);
		registerDirectEvent(registrationName + "Capture", dependencies);
	}
	function registerDirectEvent(registrationName, dependencies) {
		registrationNameDependencies[registrationName] = dependencies;
		for (registrationName = 0; registrationName < dependencies.length; registrationName++) allNativeEvents.add(dependencies[registrationName]);
	}
	var VALID_ATTRIBUTE_NAME_REGEX = RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"), illegalAttributeNameCache = {}, validatedAttributeNameCache = {};
	function isAttributeNameSafe(attributeName) {
		if (hasOwnProperty.call(validatedAttributeNameCache, attributeName)) return !0;
		if (hasOwnProperty.call(illegalAttributeNameCache, attributeName)) return !1;
		if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName)) return validatedAttributeNameCache[attributeName] = !0;
		illegalAttributeNameCache[attributeName] = !0;
		return !1;
	}
	function setValueForAttribute(node, name, value) {
		if (isAttributeNameSafe(name)) if (null === value) node.removeAttribute(name);
		else {
			switch (typeof value) {
				case "undefined":
				case "function":
				case "symbol":
					node.removeAttribute(name);
					return;
				case "boolean":
					var prefix$10 = name.toLowerCase().slice(0, 5);
					if ("data-" !== prefix$10 && "aria-" !== prefix$10) {
						node.removeAttribute(name);
						return;
					}
			}
			node.setAttribute(name, "" + value);
		}
	}
	function setValueForKnownAttribute(node, name, value) {
		if (null === value) node.removeAttribute(name);
		else {
			switch (typeof value) {
				case "undefined":
				case "function":
				case "symbol":
				case "boolean":
					node.removeAttribute(name);
					return;
			}
			node.setAttribute(name, "" + value);
		}
	}
	function setValueForNamespacedAttribute(node, namespace, name, value) {
		if (null === value) node.removeAttribute(name);
		else {
			switch (typeof value) {
				case "undefined":
				case "function":
				case "symbol":
				case "boolean":
					node.removeAttribute(name);
					return;
			}
			node.setAttributeNS(namespace, name, "" + value);
		}
	}
	function getToStringValue(value) {
		switch (typeof value) {
			case "bigint":
			case "boolean":
			case "number":
			case "string":
			case "undefined": return value;
			case "object": return value;
			default: return "";
		}
	}
	function isCheckable(elem) {
		var type = elem.type;
		return (elem = elem.nodeName) && "input" === elem.toLowerCase() && ("checkbox" === type || "radio" === type);
	}
	function trackValueOnNode(node, valueField, currentValue) {
		var descriptor = Object.getOwnPropertyDescriptor(node.constructor.prototype, valueField);
		if (!node.hasOwnProperty(valueField) && "undefined" !== typeof descriptor && "function" === typeof descriptor.get && "function" === typeof descriptor.set) {
			var get = descriptor.get, set = descriptor.set;
			Object.defineProperty(node, valueField, {
				configurable: !0,
				get: function() {
					return get.call(this);
				},
				set: function(value) {
					currentValue = "" + value;
					set.call(this, value);
				}
			});
			Object.defineProperty(node, valueField, { enumerable: descriptor.enumerable });
			return {
				getValue: function() {
					return currentValue;
				},
				setValue: function(value) {
					currentValue = "" + value;
				},
				stopTracking: function() {
					node._valueTracker = null;
					delete node[valueField];
				}
			};
		}
	}
	function track(node) {
		if (!node._valueTracker) {
			var valueField = isCheckable(node) ? "checked" : "value";
			node._valueTracker = trackValueOnNode(node, valueField, "" + node[valueField]);
		}
	}
	function updateValueIfChanged(node) {
		if (!node) return !1;
		var tracker = node._valueTracker;
		if (!tracker) return !0;
		var lastValue = tracker.getValue();
		var value = "";
		node && (value = isCheckable(node) ? node.checked ? "true" : "false" : node.value);
		node = value;
		return node !== lastValue ? (tracker.setValue(node), !0) : !1;
	}
	function getActiveElement(doc) {
		doc = doc || ("undefined" !== typeof document ? document : void 0);
		if ("undefined" === typeof doc) return null;
		try {
			return doc.activeElement || doc.body;
		} catch (e) {
			return doc.body;
		}
	}
	var escapeSelectorAttributeValueInsideDoubleQuotesRegex = /[\n"\\]/g;
	function escapeSelectorAttributeValueInsideDoubleQuotes(value) {
		return value.replace(escapeSelectorAttributeValueInsideDoubleQuotesRegex, function(ch) {
			return "\\" + ch.charCodeAt(0).toString(16) + " ";
		});
	}
	function updateInput(element, value, defaultValue, lastDefaultValue, checked, defaultChecked, type, name) {
		element.name = "";
		null != type && "function" !== typeof type && "symbol" !== typeof type && "boolean" !== typeof type ? element.type = type : element.removeAttribute("type");
		if (null != value) if ("number" === type) {
			if (0 === value && "" === element.value || element.value != value) element.value = "" + getToStringValue(value);
		} else element.value !== "" + getToStringValue(value) && (element.value = "" + getToStringValue(value));
		else "submit" !== type && "reset" !== type || element.removeAttribute("value");
		null != value ? setDefaultValue(element, type, getToStringValue(value)) : null != defaultValue ? setDefaultValue(element, type, getToStringValue(defaultValue)) : null != lastDefaultValue && element.removeAttribute("value");
		null == checked && null != defaultChecked && (element.defaultChecked = !!defaultChecked);
		null != checked && (element.checked = checked && "function" !== typeof checked && "symbol" !== typeof checked);
		null != name && "function" !== typeof name && "symbol" !== typeof name && "boolean" !== typeof name ? element.name = "" + getToStringValue(name) : element.removeAttribute("name");
	}
	function initInput(element, value, defaultValue, checked, defaultChecked, type, name, isHydrating) {
		null != type && "function" !== typeof type && "symbol" !== typeof type && "boolean" !== typeof type && (element.type = type);
		if (null != value || null != defaultValue) {
			if (!("submit" !== type && "reset" !== type || void 0 !== value && null !== value)) {
				track(element);
				return;
			}
			defaultValue = null != defaultValue ? "" + getToStringValue(defaultValue) : "";
			value = null != value ? "" + getToStringValue(value) : defaultValue;
			isHydrating || value === element.value || (element.value = value);
			element.defaultValue = value;
		}
		checked = null != checked ? checked : defaultChecked;
		checked = "function" !== typeof checked && "symbol" !== typeof checked && !!checked;
		element.checked = isHydrating ? element.checked : !!checked;
		element.defaultChecked = !!checked;
		null != name && "function" !== typeof name && "symbol" !== typeof name && "boolean" !== typeof name && (element.name = name);
		track(element);
	}
	function setDefaultValue(node, type, value) {
		"number" === type && getActiveElement(node.ownerDocument) === node || node.defaultValue === "" + value || (node.defaultValue = "" + value);
	}
	function updateOptions(node, multiple, propValue, setDefaultSelected) {
		node = node.options;
		if (multiple) {
			multiple = {};
			for (var i = 0; i < propValue.length; i++) multiple["$" + propValue[i]] = !0;
			for (propValue = 0; propValue < node.length; propValue++) i = multiple.hasOwnProperty("$" + node[propValue].value), node[propValue].selected !== i && (node[propValue].selected = i), i && setDefaultSelected && (node[propValue].defaultSelected = !0);
		} else {
			propValue = "" + getToStringValue(propValue);
			multiple = null;
			for (i = 0; i < node.length; i++) {
				if (node[i].value === propValue) {
					node[i].selected = !0;
					setDefaultSelected && (node[i].defaultSelected = !0);
					return;
				}
				null !== multiple || node[i].disabled || (multiple = node[i]);
			}
			null !== multiple && (multiple.selected = !0);
		}
	}
	function updateTextarea(element, value, defaultValue) {
		if (null != value && (value = "" + getToStringValue(value), value !== element.value && (element.value = value), null == defaultValue)) {
			element.defaultValue !== value && (element.defaultValue = value);
			return;
		}
		element.defaultValue = null != defaultValue ? "" + getToStringValue(defaultValue) : "";
	}
	function initTextarea(element, value, defaultValue, children) {
		if (null == value) {
			if (null != children) {
				if (null != defaultValue) throw Error(formatProdErrorMessage(92));
				if (isArrayImpl(children)) {
					if (1 < children.length) throw Error(formatProdErrorMessage(93));
					children = children[0];
				}
				defaultValue = children;
			}
			defaultValue ??= "";
			value = defaultValue;
		}
		defaultValue = getToStringValue(value);
		element.defaultValue = defaultValue;
		children = element.textContent;
		children === defaultValue && "" !== children && null !== children && (element.value = children);
		track(element);
	}
	function setTextContent(node, text) {
		if (text) {
			var firstChild = node.firstChild;
			if (firstChild && firstChild === node.lastChild && 3 === firstChild.nodeType) {
				firstChild.nodeValue = text;
				return;
			}
		}
		node.textContent = text;
	}
	var unitlessNumbers = new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));
	function setValueForStyle(style, styleName, value) {
		var isCustomProperty = 0 === styleName.indexOf("--");
		null == value || "boolean" === typeof value || "" === value ? isCustomProperty ? style.setProperty(styleName, "") : "float" === styleName ? style.cssFloat = "" : style[styleName] = "" : isCustomProperty ? style.setProperty(styleName, value) : "number" !== typeof value || 0 === value || unitlessNumbers.has(styleName) ? "float" === styleName ? style.cssFloat = value : style[styleName] = ("" + value).trim() : style[styleName] = value + "px";
	}
	function setValueForStyles(node, styles, prevStyles) {
		if (null != styles && "object" !== typeof styles) throw Error(formatProdErrorMessage(62));
		node = node.style;
		if (null != prevStyles) {
			for (var styleName in prevStyles) !prevStyles.hasOwnProperty(styleName) || null != styles && styles.hasOwnProperty(styleName) || (0 === styleName.indexOf("--") ? node.setProperty(styleName, "") : "float" === styleName ? node.cssFloat = "" : node[styleName] = "");
			for (var styleName$16 in styles) styleName = styles[styleName$16], styles.hasOwnProperty(styleName$16) && prevStyles[styleName$16] !== styleName && setValueForStyle(node, styleName$16, styleName);
		} else for (var styleName$17 in styles) styles.hasOwnProperty(styleName$17) && setValueForStyle(node, styleName$17, styles[styleName$17]);
	}
	function isCustomElement(tagName) {
		if (-1 === tagName.indexOf("-")) return !1;
		switch (tagName) {
			case "annotation-xml":
			case "color-profile":
			case "font-face":
			case "font-face-src":
			case "font-face-uri":
			case "font-face-format":
			case "font-face-name":
			case "missing-glyph": return !1;
			default: return !0;
		}
	}
	var aliases = new Map([
		["acceptCharset", "accept-charset"],
		["htmlFor", "for"],
		["httpEquiv", "http-equiv"],
		["crossOrigin", "crossorigin"],
		["accentHeight", "accent-height"],
		["alignmentBaseline", "alignment-baseline"],
		["arabicForm", "arabic-form"],
		["baselineShift", "baseline-shift"],
		["capHeight", "cap-height"],
		["clipPath", "clip-path"],
		["clipRule", "clip-rule"],
		["colorInterpolation", "color-interpolation"],
		["colorInterpolationFilters", "color-interpolation-filters"],
		["colorProfile", "color-profile"],
		["colorRendering", "color-rendering"],
		["dominantBaseline", "dominant-baseline"],
		["enableBackground", "enable-background"],
		["fillOpacity", "fill-opacity"],
		["fillRule", "fill-rule"],
		["floodColor", "flood-color"],
		["floodOpacity", "flood-opacity"],
		["fontFamily", "font-family"],
		["fontSize", "font-size"],
		["fontSizeAdjust", "font-size-adjust"],
		["fontStretch", "font-stretch"],
		["fontStyle", "font-style"],
		["fontVariant", "font-variant"],
		["fontWeight", "font-weight"],
		["glyphName", "glyph-name"],
		["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
		["glyphOrientationVertical", "glyph-orientation-vertical"],
		["horizAdvX", "horiz-adv-x"],
		["horizOriginX", "horiz-origin-x"],
		["imageRendering", "image-rendering"],
		["letterSpacing", "letter-spacing"],
		["lightingColor", "lighting-color"],
		["markerEnd", "marker-end"],
		["markerMid", "marker-mid"],
		["markerStart", "marker-start"],
		["overlinePosition", "overline-position"],
		["overlineThickness", "overline-thickness"],
		["paintOrder", "paint-order"],
		["panose-1", "panose-1"],
		["pointerEvents", "pointer-events"],
		["renderingIntent", "rendering-intent"],
		["shapeRendering", "shape-rendering"],
		["stopColor", "stop-color"],
		["stopOpacity", "stop-opacity"],
		["strikethroughPosition", "strikethrough-position"],
		["strikethroughThickness", "strikethrough-thickness"],
		["strokeDasharray", "stroke-dasharray"],
		["strokeDashoffset", "stroke-dashoffset"],
		["strokeLinecap", "stroke-linecap"],
		["strokeLinejoin", "stroke-linejoin"],
		["strokeMiterlimit", "stroke-miterlimit"],
		["strokeOpacity", "stroke-opacity"],
		["strokeWidth", "stroke-width"],
		["textAnchor", "text-anchor"],
		["textDecoration", "text-decoration"],
		["textRendering", "text-rendering"],
		["transformOrigin", "transform-origin"],
		["underlinePosition", "underline-position"],
		["underlineThickness", "underline-thickness"],
		["unicodeBidi", "unicode-bidi"],
		["unicodeRange", "unicode-range"],
		["unitsPerEm", "units-per-em"],
		["vAlphabetic", "v-alphabetic"],
		["vHanging", "v-hanging"],
		["vIdeographic", "v-ideographic"],
		["vMathematical", "v-mathematical"],
		["vectorEffect", "vector-effect"],
		["vertAdvY", "vert-adv-y"],
		["vertOriginX", "vert-origin-x"],
		["vertOriginY", "vert-origin-y"],
		["wordSpacing", "word-spacing"],
		["writingMode", "writing-mode"],
		["xmlnsXlink", "xmlns:xlink"],
		["xHeight", "x-height"]
	]), isJavaScriptProtocol = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
	function sanitizeURL(url) {
		return isJavaScriptProtocol.test("" + url) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : url;
	}
	function noop$1() {}
	var currentReplayingEvent = null;
	function getEventTarget(nativeEvent) {
		nativeEvent = nativeEvent.target || nativeEvent.srcElement || window;
		nativeEvent.correspondingUseElement && (nativeEvent = nativeEvent.correspondingUseElement);
		return 3 === nativeEvent.nodeType ? nativeEvent.parentNode : nativeEvent;
	}
	var restoreTarget = null, restoreQueue = null;
	function restoreStateOfTarget(target) {
		var internalInstance = getInstanceFromNode(target);
		if (internalInstance && (target = internalInstance.stateNode)) {
			var props = target[internalPropsKey] || null;
			a: switch (target = internalInstance.stateNode, internalInstance.type) {
				case "input":
					updateInput(target, props.value, props.defaultValue, props.defaultValue, props.checked, props.defaultChecked, props.type, props.name);
					internalInstance = props.name;
					if ("radio" === props.type && null != internalInstance) {
						for (props = target; props.parentNode;) props = props.parentNode;
						props = props.querySelectorAll("input[name=\"" + escapeSelectorAttributeValueInsideDoubleQuotes("" + internalInstance) + "\"][type=\"radio\"]");
						for (internalInstance = 0; internalInstance < props.length; internalInstance++) {
							var otherNode = props[internalInstance];
							if (otherNode !== target && otherNode.form === target.form) {
								var otherProps = otherNode[internalPropsKey] || null;
								if (!otherProps) throw Error(formatProdErrorMessage(90));
								updateInput(otherNode, otherProps.value, otherProps.defaultValue, otherProps.defaultValue, otherProps.checked, otherProps.defaultChecked, otherProps.type, otherProps.name);
							}
						}
						for (internalInstance = 0; internalInstance < props.length; internalInstance++) otherNode = props[internalInstance], otherNode.form === target.form && updateValueIfChanged(otherNode);
					}
					break a;
				case "textarea":
					updateTextarea(target, props.value, props.defaultValue);
					break a;
				case "select": internalInstance = props.value, null != internalInstance && updateOptions(target, !!props.multiple, internalInstance, !1);
			}
		}
	}
	var isInsideEventHandler = !1;
	function batchedUpdates$1(fn, a, b) {
		if (isInsideEventHandler) return fn(a, b);
		isInsideEventHandler = !0;
		try {
			return fn(a);
		} finally {
			if (isInsideEventHandler = !1, null !== restoreTarget || null !== restoreQueue) {
				if (flushSyncWork$1(), restoreTarget && (a = restoreTarget, fn = restoreQueue, restoreQueue = restoreTarget = null, restoreStateOfTarget(a), fn)) for (a = 0; a < fn.length; a++) restoreStateOfTarget(fn[a]);
			}
		}
	}
	function getListener(inst, registrationName) {
		var stateNode = inst.stateNode;
		if (null === stateNode) return null;
		var props = stateNode[internalPropsKey] || null;
		if (null === props) return null;
		stateNode = props[registrationName];
		a: switch (registrationName) {
			case "onClick":
			case "onClickCapture":
			case "onDoubleClick":
			case "onDoubleClickCapture":
			case "onMouseDown":
			case "onMouseDownCapture":
			case "onMouseMove":
			case "onMouseMoveCapture":
			case "onMouseUp":
			case "onMouseUpCapture":
			case "onMouseEnter":
				(props = !props.disabled) || (inst = inst.type, props = !("button" === inst || "input" === inst || "select" === inst || "textarea" === inst));
				inst = !props;
				break a;
			default: inst = !1;
		}
		if (inst) return null;
		if (stateNode && "function" !== typeof stateNode) throw Error(formatProdErrorMessage(231, registrationName, typeof stateNode));
		return stateNode;
	}
	var canUseDOM = !("undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement), passiveBrowserEventsSupported = !1;
	if (canUseDOM) try {
		var options = {};
		Object.defineProperty(options, "passive", { get: function() {
			passiveBrowserEventsSupported = !0;
		} });
		window.addEventListener("test", options, options);
		window.removeEventListener("test", options, options);
	} catch (e) {
		passiveBrowserEventsSupported = !1;
	}
	var root = null, startText = null, fallbackText = null;
	function getData() {
		if (fallbackText) return fallbackText;
		var start, startValue = startText, startLength = startValue.length, end, endValue = "value" in root ? root.value : root.textContent, endLength = endValue.length;
		for (start = 0; start < startLength && startValue[start] === endValue[start]; start++);
		var minEnd = startLength - start;
		for (end = 1; end <= minEnd && startValue[startLength - end] === endValue[endLength - end]; end++);
		return fallbackText = endValue.slice(start, 1 < end ? 1 - end : void 0);
	}
	function getEventCharCode(nativeEvent) {
		var keyCode = nativeEvent.keyCode;
		"charCode" in nativeEvent ? (nativeEvent = nativeEvent.charCode, 0 === nativeEvent && 13 === keyCode && (nativeEvent = 13)) : nativeEvent = keyCode;
		10 === nativeEvent && (nativeEvent = 13);
		return 32 <= nativeEvent || 13 === nativeEvent ? nativeEvent : 0;
	}
	function functionThatReturnsTrue() {
		return !0;
	}
	function functionThatReturnsFalse() {
		return !1;
	}
	function createSyntheticEvent(Interface) {
		function SyntheticBaseEvent(reactName, reactEventType, targetInst, nativeEvent, nativeEventTarget) {
			this._reactName = reactName;
			this._targetInst = targetInst;
			this.type = reactEventType;
			this.nativeEvent = nativeEvent;
			this.target = nativeEventTarget;
			this.currentTarget = null;
			for (var propName in Interface) Interface.hasOwnProperty(propName) && (reactName = Interface[propName], this[propName] = reactName ? reactName(nativeEvent) : nativeEvent[propName]);
			this.isDefaultPrevented = (null != nativeEvent.defaultPrevented ? nativeEvent.defaultPrevented : !1 === nativeEvent.returnValue) ? functionThatReturnsTrue : functionThatReturnsFalse;
			this.isPropagationStopped = functionThatReturnsFalse;
			return this;
		}
		assign(SyntheticBaseEvent.prototype, {
			preventDefault: function() {
				this.defaultPrevented = !0;
				var event = this.nativeEvent;
				event && (event.preventDefault ? event.preventDefault() : "unknown" !== typeof event.returnValue && (event.returnValue = !1), this.isDefaultPrevented = functionThatReturnsTrue);
			},
			stopPropagation: function() {
				var event = this.nativeEvent;
				event && (event.stopPropagation ? event.stopPropagation() : "unknown" !== typeof event.cancelBubble && (event.cancelBubble = !0), this.isPropagationStopped = functionThatReturnsTrue);
			},
			persist: function() {},
			isPersistent: functionThatReturnsTrue
		});
		return SyntheticBaseEvent;
	}
	var EventInterface = {
		eventPhase: 0,
		bubbles: 0,
		cancelable: 0,
		timeStamp: function(event) {
			return event.timeStamp || Date.now();
		},
		defaultPrevented: 0,
		isTrusted: 0
	}, SyntheticEvent = createSyntheticEvent(EventInterface), UIEventInterface = assign({}, EventInterface, {
		view: 0,
		detail: 0
	}), SyntheticUIEvent = createSyntheticEvent(UIEventInterface), lastMovementX, lastMovementY, lastMouseEvent, MouseEventInterface = assign({}, UIEventInterface, {
		screenX: 0,
		screenY: 0,
		clientX: 0,
		clientY: 0,
		pageX: 0,
		pageY: 0,
		ctrlKey: 0,
		shiftKey: 0,
		altKey: 0,
		metaKey: 0,
		getModifierState: getEventModifierState,
		button: 0,
		buttons: 0,
		relatedTarget: function(event) {
			return void 0 === event.relatedTarget ? event.fromElement === event.srcElement ? event.toElement : event.fromElement : event.relatedTarget;
		},
		movementX: function(event) {
			if ("movementX" in event) return event.movementX;
			event !== lastMouseEvent && (lastMouseEvent && "mousemove" === event.type ? (lastMovementX = event.screenX - lastMouseEvent.screenX, lastMovementY = event.screenY - lastMouseEvent.screenY) : lastMovementY = lastMovementX = 0, lastMouseEvent = event);
			return lastMovementX;
		},
		movementY: function(event) {
			return "movementY" in event ? event.movementY : lastMovementY;
		}
	}), SyntheticMouseEvent = createSyntheticEvent(MouseEventInterface), SyntheticDragEvent = createSyntheticEvent(assign({}, MouseEventInterface, { dataTransfer: 0 })), SyntheticFocusEvent = createSyntheticEvent(assign({}, UIEventInterface, { relatedTarget: 0 })), SyntheticAnimationEvent = createSyntheticEvent(assign({}, EventInterface, {
		animationName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), SyntheticClipboardEvent = createSyntheticEvent(assign({}, EventInterface, { clipboardData: function(event) {
		return "clipboardData" in event ? event.clipboardData : window.clipboardData;
	} })), SyntheticCompositionEvent = createSyntheticEvent(assign({}, EventInterface, { data: 0 })), normalizeKey = {
		Esc: "Escape",
		Spacebar: " ",
		Left: "ArrowLeft",
		Up: "ArrowUp",
		Right: "ArrowRight",
		Down: "ArrowDown",
		Del: "Delete",
		Win: "OS",
		Menu: "ContextMenu",
		Apps: "ContextMenu",
		Scroll: "ScrollLock",
		MozPrintableKey: "Unidentified"
	}, translateToKey = {
		8: "Backspace",
		9: "Tab",
		12: "Clear",
		13: "Enter",
		16: "Shift",
		17: "Control",
		18: "Alt",
		19: "Pause",
		20: "CapsLock",
		27: "Escape",
		32: " ",
		33: "PageUp",
		34: "PageDown",
		35: "End",
		36: "Home",
		37: "ArrowLeft",
		38: "ArrowUp",
		39: "ArrowRight",
		40: "ArrowDown",
		45: "Insert",
		46: "Delete",
		112: "F1",
		113: "F2",
		114: "F3",
		115: "F4",
		116: "F5",
		117: "F6",
		118: "F7",
		119: "F8",
		120: "F9",
		121: "F10",
		122: "F11",
		123: "F12",
		144: "NumLock",
		145: "ScrollLock",
		224: "Meta"
	}, modifierKeyToProp = {
		Alt: "altKey",
		Control: "ctrlKey",
		Meta: "metaKey",
		Shift: "shiftKey"
	};
	function modifierStateGetter(keyArg) {
		var nativeEvent = this.nativeEvent;
		return nativeEvent.getModifierState ? nativeEvent.getModifierState(keyArg) : (keyArg = modifierKeyToProp[keyArg]) ? !!nativeEvent[keyArg] : !1;
	}
	function getEventModifierState() {
		return modifierStateGetter;
	}
	var SyntheticKeyboardEvent = createSyntheticEvent(assign({}, UIEventInterface, {
		key: function(nativeEvent) {
			if (nativeEvent.key) {
				var key = normalizeKey[nativeEvent.key] || nativeEvent.key;
				if ("Unidentified" !== key) return key;
			}
			return "keypress" === nativeEvent.type ? (nativeEvent = getEventCharCode(nativeEvent), 13 === nativeEvent ? "Enter" : String.fromCharCode(nativeEvent)) : "keydown" === nativeEvent.type || "keyup" === nativeEvent.type ? translateToKey[nativeEvent.keyCode] || "Unidentified" : "";
		},
		code: 0,
		location: 0,
		ctrlKey: 0,
		shiftKey: 0,
		altKey: 0,
		metaKey: 0,
		repeat: 0,
		locale: 0,
		getModifierState: getEventModifierState,
		charCode: function(event) {
			return "keypress" === event.type ? getEventCharCode(event) : 0;
		},
		keyCode: function(event) {
			return "keydown" === event.type || "keyup" === event.type ? event.keyCode : 0;
		},
		which: function(event) {
			return "keypress" === event.type ? getEventCharCode(event) : "keydown" === event.type || "keyup" === event.type ? event.keyCode : 0;
		}
	})), SyntheticPointerEvent = createSyntheticEvent(assign({}, MouseEventInterface, {
		pointerId: 0,
		width: 0,
		height: 0,
		pressure: 0,
		tangentialPressure: 0,
		tiltX: 0,
		tiltY: 0,
		twist: 0,
		pointerType: 0,
		isPrimary: 0
	})), SyntheticTouchEvent = createSyntheticEvent(assign({}, UIEventInterface, {
		touches: 0,
		targetTouches: 0,
		changedTouches: 0,
		altKey: 0,
		metaKey: 0,
		ctrlKey: 0,
		shiftKey: 0,
		getModifierState: getEventModifierState
	})), SyntheticTransitionEvent = createSyntheticEvent(assign({}, EventInterface, {
		propertyName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), SyntheticWheelEvent = createSyntheticEvent(assign({}, MouseEventInterface, {
		deltaX: function(event) {
			return "deltaX" in event ? event.deltaX : "wheelDeltaX" in event ? -event.wheelDeltaX : 0;
		},
		deltaY: function(event) {
			return "deltaY" in event ? event.deltaY : "wheelDeltaY" in event ? -event.wheelDeltaY : "wheelDelta" in event ? -event.wheelDelta : 0;
		},
		deltaZ: 0,
		deltaMode: 0
	})), SyntheticToggleEvent = createSyntheticEvent(assign({}, EventInterface, {
		newState: 0,
		oldState: 0
	})), END_KEYCODES = [
		9,
		13,
		27,
		32
	], canUseCompositionEvent = canUseDOM && "CompositionEvent" in window, documentMode = null;
	canUseDOM && "documentMode" in document && (documentMode = document.documentMode);
	var canUseTextInputEvent = canUseDOM && "TextEvent" in window && !documentMode, useFallbackCompositionData = canUseDOM && (!canUseCompositionEvent || documentMode && 8 < documentMode && 11 >= documentMode), SPACEBAR_CHAR = String.fromCharCode(32), hasSpaceKeypress = !1;
	function isFallbackCompositionEnd(domEventName, nativeEvent) {
		switch (domEventName) {
			case "keyup": return -1 !== END_KEYCODES.indexOf(nativeEvent.keyCode);
			case "keydown": return 229 !== nativeEvent.keyCode;
			case "keypress":
			case "mousedown":
			case "focusout": return !0;
			default: return !1;
		}
	}
	function getDataFromCustomEvent(nativeEvent) {
		nativeEvent = nativeEvent.detail;
		return "object" === typeof nativeEvent && "data" in nativeEvent ? nativeEvent.data : null;
	}
	var isComposing = !1;
	function getNativeBeforeInputChars(domEventName, nativeEvent) {
		switch (domEventName) {
			case "compositionend": return getDataFromCustomEvent(nativeEvent);
			case "keypress":
				if (32 !== nativeEvent.which) return null;
				hasSpaceKeypress = !0;
				return SPACEBAR_CHAR;
			case "textInput": return domEventName = nativeEvent.data, domEventName === SPACEBAR_CHAR && hasSpaceKeypress ? null : domEventName;
			default: return null;
		}
	}
	function getFallbackBeforeInputChars(domEventName, nativeEvent) {
		if (isComposing) return "compositionend" === domEventName || !canUseCompositionEvent && isFallbackCompositionEnd(domEventName, nativeEvent) ? (domEventName = getData(), fallbackText = startText = root = null, isComposing = !1, domEventName) : null;
		switch (domEventName) {
			case "paste": return null;
			case "keypress":
				if (!(nativeEvent.ctrlKey || nativeEvent.altKey || nativeEvent.metaKey) || nativeEvent.ctrlKey && nativeEvent.altKey) {
					if (nativeEvent.char && 1 < nativeEvent.char.length) return nativeEvent.char;
					if (nativeEvent.which) return String.fromCharCode(nativeEvent.which);
				}
				return null;
			case "compositionend": return useFallbackCompositionData && "ko" !== nativeEvent.locale ? null : nativeEvent.data;
			default: return null;
		}
	}
	var supportedInputTypes = {
		color: !0,
		date: !0,
		datetime: !0,
		"datetime-local": !0,
		email: !0,
		month: !0,
		number: !0,
		password: !0,
		range: !0,
		search: !0,
		tel: !0,
		text: !0,
		time: !0,
		url: !0,
		week: !0
	};
	function isTextInputElement(elem) {
		var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
		return "input" === nodeName ? !!supportedInputTypes[elem.type] : "textarea" === nodeName ? !0 : !1;
	}
	function createAndAccumulateChangeEvent(dispatchQueue, inst, nativeEvent, target) {
		restoreTarget ? restoreQueue ? restoreQueue.push(target) : restoreQueue = [target] : restoreTarget = target;
		inst = accumulateTwoPhaseListeners(inst, "onChange");
		0 < inst.length && (nativeEvent = new SyntheticEvent("onChange", "change", null, nativeEvent, target), dispatchQueue.push({
			event: nativeEvent,
			listeners: inst
		}));
	}
	var activeElement$1 = null, activeElementInst$1 = null;
	function runEventInBatch(dispatchQueue) {
		processDispatchQueue(dispatchQueue, 0);
	}
	function getInstIfValueChanged(targetInst) {
		if (updateValueIfChanged(getNodeFromInstance(targetInst))) return targetInst;
	}
	function getTargetInstForChangeEvent(domEventName, targetInst) {
		if ("change" === domEventName) return targetInst;
	}
	var isInputEventSupported = !1;
	if (canUseDOM) {
		var JSCompiler_inline_result$jscomp$286;
		if (canUseDOM) {
			var isSupported$jscomp$inline_427 = "oninput" in document;
			if (!isSupported$jscomp$inline_427) {
				var element$jscomp$inline_428 = document.createElement("div");
				element$jscomp$inline_428.setAttribute("oninput", "return;");
				isSupported$jscomp$inline_427 = "function" === typeof element$jscomp$inline_428.oninput;
			}
			JSCompiler_inline_result$jscomp$286 = isSupported$jscomp$inline_427;
		} else JSCompiler_inline_result$jscomp$286 = !1;
		isInputEventSupported = JSCompiler_inline_result$jscomp$286 && (!document.documentMode || 9 < document.documentMode);
	}
	function stopWatchingForValueChange() {
		activeElement$1 && (activeElement$1.detachEvent("onpropertychange", handlePropertyChange), activeElementInst$1 = activeElement$1 = null);
	}
	function handlePropertyChange(nativeEvent) {
		if ("value" === nativeEvent.propertyName && getInstIfValueChanged(activeElementInst$1)) {
			var dispatchQueue = [];
			createAndAccumulateChangeEvent(dispatchQueue, activeElementInst$1, nativeEvent, getEventTarget(nativeEvent));
			batchedUpdates$1(runEventInBatch, dispatchQueue);
		}
	}
	function handleEventsForInputEventPolyfill(domEventName, target, targetInst) {
		"focusin" === domEventName ? (stopWatchingForValueChange(), activeElement$1 = target, activeElementInst$1 = targetInst, activeElement$1.attachEvent("onpropertychange", handlePropertyChange)) : "focusout" === domEventName && stopWatchingForValueChange();
	}
	function getTargetInstForInputEventPolyfill(domEventName) {
		if ("selectionchange" === domEventName || "keyup" === domEventName || "keydown" === domEventName) return getInstIfValueChanged(activeElementInst$1);
	}
	function getTargetInstForClickEvent(domEventName, targetInst) {
		if ("click" === domEventName) return getInstIfValueChanged(targetInst);
	}
	function getTargetInstForInputOrChangeEvent(domEventName, targetInst) {
		if ("input" === domEventName || "change" === domEventName) return getInstIfValueChanged(targetInst);
	}
	function is(x, y) {
		return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
	}
	var objectIs = "function" === typeof Object.is ? Object.is : is;
	function shallowEqual(objA, objB) {
		if (objectIs(objA, objB)) return !0;
		if ("object" !== typeof objA || null === objA || "object" !== typeof objB || null === objB) return !1;
		var keysA = Object.keys(objA), keysB = Object.keys(objB);
		if (keysA.length !== keysB.length) return !1;
		for (keysB = 0; keysB < keysA.length; keysB++) {
			var currentKey = keysA[keysB];
			if (!hasOwnProperty.call(objB, currentKey) || !objectIs(objA[currentKey], objB[currentKey])) return !1;
		}
		return !0;
	}
	function getLeafNode(node) {
		for (; node && node.firstChild;) node = node.firstChild;
		return node;
	}
	function getNodeForCharacterOffset(root, offset) {
		var node = getLeafNode(root);
		root = 0;
		for (var nodeEnd; node;) {
			if (3 === node.nodeType) {
				nodeEnd = root + node.textContent.length;
				if (root <= offset && nodeEnd >= offset) return {
					node,
					offset: offset - root
				};
				root = nodeEnd;
			}
			a: {
				for (; node;) {
					if (node.nextSibling) {
						node = node.nextSibling;
						break a;
					}
					node = node.parentNode;
				}
				node = void 0;
			}
			node = getLeafNode(node);
		}
	}
	function containsNode(outerNode, innerNode) {
		return outerNode && innerNode ? outerNode === innerNode ? !0 : outerNode && 3 === outerNode.nodeType ? !1 : innerNode && 3 === innerNode.nodeType ? containsNode(outerNode, innerNode.parentNode) : "contains" in outerNode ? outerNode.contains(innerNode) : outerNode.compareDocumentPosition ? !!(outerNode.compareDocumentPosition(innerNode) & 16) : !1 : !1;
	}
	function getActiveElementDeep(containerInfo) {
		containerInfo = null != containerInfo && null != containerInfo.ownerDocument && null != containerInfo.ownerDocument.defaultView ? containerInfo.ownerDocument.defaultView : window;
		for (var element = getActiveElement(containerInfo.document); element instanceof containerInfo.HTMLIFrameElement;) {
			try {
				var JSCompiler_inline_result = "string" === typeof element.contentWindow.location.href;
			} catch (err) {
				JSCompiler_inline_result = !1;
			}
			if (JSCompiler_inline_result) containerInfo = element.contentWindow;
			else break;
			element = getActiveElement(containerInfo.document);
		}
		return element;
	}
	function hasSelectionCapabilities(elem) {
		var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
		return nodeName && ("input" === nodeName && ("text" === elem.type || "search" === elem.type || "tel" === elem.type || "url" === elem.type || "password" === elem.type) || "textarea" === nodeName || "true" === elem.contentEditable);
	}
	var skipSelectionChangeEvent = canUseDOM && "documentMode" in document && 11 >= document.documentMode, activeElement = null, activeElementInst = null, lastSelection = null, mouseDown = !1;
	function constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget) {
		var doc = nativeEventTarget.window === nativeEventTarget ? nativeEventTarget.document : 9 === nativeEventTarget.nodeType ? nativeEventTarget : nativeEventTarget.ownerDocument;
		mouseDown || null == activeElement || activeElement !== getActiveElement(doc) || (doc = activeElement, "selectionStart" in doc && hasSelectionCapabilities(doc) ? doc = {
			start: doc.selectionStart,
			end: doc.selectionEnd
		} : (doc = (doc.ownerDocument && doc.ownerDocument.defaultView || window).getSelection(), doc = {
			anchorNode: doc.anchorNode,
			anchorOffset: doc.anchorOffset,
			focusNode: doc.focusNode,
			focusOffset: doc.focusOffset
		}), lastSelection && shallowEqual(lastSelection, doc) || (lastSelection = doc, doc = accumulateTwoPhaseListeners(activeElementInst, "onSelect"), 0 < doc.length && (nativeEvent = new SyntheticEvent("onSelect", "select", null, nativeEvent, nativeEventTarget), dispatchQueue.push({
			event: nativeEvent,
			listeners: doc
		}), nativeEvent.target = activeElement)));
	}
	function makePrefixMap(styleProp, eventName) {
		var prefixes = {};
		prefixes[styleProp.toLowerCase()] = eventName.toLowerCase();
		prefixes["Webkit" + styleProp] = "webkit" + eventName;
		prefixes["Moz" + styleProp] = "moz" + eventName;
		return prefixes;
	}
	var vendorPrefixes = {
		animationend: makePrefixMap("Animation", "AnimationEnd"),
		animationiteration: makePrefixMap("Animation", "AnimationIteration"),
		animationstart: makePrefixMap("Animation", "AnimationStart"),
		transitionrun: makePrefixMap("Transition", "TransitionRun"),
		transitionstart: makePrefixMap("Transition", "TransitionStart"),
		transitioncancel: makePrefixMap("Transition", "TransitionCancel"),
		transitionend: makePrefixMap("Transition", "TransitionEnd")
	}, prefixedEventNames = {}, style = {};
	canUseDOM && (style = document.createElement("div").style, "AnimationEvent" in window || (delete vendorPrefixes.animationend.animation, delete vendorPrefixes.animationiteration.animation, delete vendorPrefixes.animationstart.animation), "TransitionEvent" in window || delete vendorPrefixes.transitionend.transition);
	function getVendorPrefixedEventName(eventName) {
		if (prefixedEventNames[eventName]) return prefixedEventNames[eventName];
		if (!vendorPrefixes[eventName]) return eventName;
		var prefixMap = vendorPrefixes[eventName], styleProp;
		for (styleProp in prefixMap) if (prefixMap.hasOwnProperty(styleProp) && styleProp in style) return prefixedEventNames[eventName] = prefixMap[styleProp];
		return eventName;
	}
	var ANIMATION_END = getVendorPrefixedEventName("animationend"), ANIMATION_ITERATION = getVendorPrefixedEventName("animationiteration"), ANIMATION_START = getVendorPrefixedEventName("animationstart"), TRANSITION_RUN = getVendorPrefixedEventName("transitionrun"), TRANSITION_START = getVendorPrefixedEventName("transitionstart"), TRANSITION_CANCEL = getVendorPrefixedEventName("transitioncancel"), TRANSITION_END = getVendorPrefixedEventName("transitionend"), topLevelEventsToReactNames = /* @__PURE__ */ new Map(), simpleEventPluginEvents = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
	simpleEventPluginEvents.push("scrollEnd");
	function registerSimpleEvent(domEventName, reactName) {
		topLevelEventsToReactNames.set(domEventName, reactName);
		registerTwoPhaseEvent(reactName, [domEventName]);
	}
	var reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
		if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
			var event = new window.ErrorEvent("error", {
				bubbles: !0,
				cancelable: !0,
				message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
				error
			});
			if (!window.dispatchEvent(event)) return;
		} else if ("object" === typeof process && "function" === typeof process.emit) {
			process.emit("uncaughtException", error);
			return;
		}
		console.error(error);
	}, concurrentQueues = [], concurrentQueuesIndex = 0, concurrentlyUpdatedLanes = 0;
	function finishQueueingConcurrentUpdates() {
		for (var endIndex = concurrentQueuesIndex, i = concurrentlyUpdatedLanes = concurrentQueuesIndex = 0; i < endIndex;) {
			var fiber = concurrentQueues[i];
			concurrentQueues[i++] = null;
			var queue = concurrentQueues[i];
			concurrentQueues[i++] = null;
			var update = concurrentQueues[i];
			concurrentQueues[i++] = null;
			var lane = concurrentQueues[i];
			concurrentQueues[i++] = null;
			if (null !== queue && null !== update) {
				var pending = queue.pending;
				null === pending ? update.next = update : (update.next = pending.next, pending.next = update);
				queue.pending = update;
			}
			0 !== lane && markUpdateLaneFromFiberToRoot(fiber, update, lane);
		}
	}
	function enqueueUpdate$1(fiber, queue, update, lane) {
		concurrentQueues[concurrentQueuesIndex++] = fiber;
		concurrentQueues[concurrentQueuesIndex++] = queue;
		concurrentQueues[concurrentQueuesIndex++] = update;
		concurrentQueues[concurrentQueuesIndex++] = lane;
		concurrentlyUpdatedLanes |= lane;
		fiber.lanes |= lane;
		fiber = fiber.alternate;
		null !== fiber && (fiber.lanes |= lane);
	}
	function enqueueConcurrentHookUpdate(fiber, queue, update, lane) {
		enqueueUpdate$1(fiber, queue, update, lane);
		return getRootForUpdatedFiber(fiber);
	}
	function enqueueConcurrentRenderForLane(fiber, lane) {
		enqueueUpdate$1(fiber, null, null, lane);
		return getRootForUpdatedFiber(fiber);
	}
	function markUpdateLaneFromFiberToRoot(sourceFiber, update, lane) {
		sourceFiber.lanes |= lane;
		var alternate = sourceFiber.alternate;
		null !== alternate && (alternate.lanes |= lane);
		for (var isHidden = !1, parent = sourceFiber.return; null !== parent;) parent.childLanes |= lane, alternate = parent.alternate, null !== alternate && (alternate.childLanes |= lane), 22 === parent.tag && (sourceFiber = parent.stateNode, null === sourceFiber || sourceFiber._visibility & 1 || (isHidden = !0)), sourceFiber = parent, parent = parent.return;
		return 3 === sourceFiber.tag ? (parent = sourceFiber.stateNode, isHidden && null !== update && (isHidden = 31 - clz32(lane), sourceFiber = parent.hiddenUpdates, alternate = sourceFiber[isHidden], null === alternate ? sourceFiber[isHidden] = [update] : alternate.push(update), update.lane = lane | 536870912), parent) : null;
	}
	function getRootForUpdatedFiber(sourceFiber) {
		if (50 < nestedUpdateCount) throw nestedUpdateCount = 0, rootWithNestedUpdates = null, Error(formatProdErrorMessage(185));
		for (var parent = sourceFiber.return; null !== parent;) sourceFiber = parent, parent = sourceFiber.return;
		return 3 === sourceFiber.tag ? sourceFiber.stateNode : null;
	}
	var emptyContextObject = {};
	function FiberNode(tag, pendingProps, key, mode) {
		this.tag = tag;
		this.key = key;
		this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null;
		this.index = 0;
		this.refCleanup = this.ref = null;
		this.pendingProps = pendingProps;
		this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null;
		this.mode = mode;
		this.subtreeFlags = this.flags = 0;
		this.deletions = null;
		this.childLanes = this.lanes = 0;
		this.alternate = null;
	}
	function createFiberImplClass(tag, pendingProps, key, mode) {
		return new FiberNode(tag, pendingProps, key, mode);
	}
	function shouldConstruct(Component) {
		Component = Component.prototype;
		return !(!Component || !Component.isReactComponent);
	}
	function createWorkInProgress(current, pendingProps) {
		var workInProgress = current.alternate;
		null === workInProgress ? (workInProgress = createFiberImplClass(current.tag, pendingProps, current.key, current.mode), workInProgress.elementType = current.elementType, workInProgress.type = current.type, workInProgress.stateNode = current.stateNode, workInProgress.alternate = current, current.alternate = workInProgress) : (workInProgress.pendingProps = pendingProps, workInProgress.type = current.type, workInProgress.flags = 0, workInProgress.subtreeFlags = 0, workInProgress.deletions = null);
		workInProgress.flags = current.flags & 65011712;
		workInProgress.childLanes = current.childLanes;
		workInProgress.lanes = current.lanes;
		workInProgress.child = current.child;
		workInProgress.memoizedProps = current.memoizedProps;
		workInProgress.memoizedState = current.memoizedState;
		workInProgress.updateQueue = current.updateQueue;
		pendingProps = current.dependencies;
		workInProgress.dependencies = null === pendingProps ? null : {
			lanes: pendingProps.lanes,
			firstContext: pendingProps.firstContext
		};
		workInProgress.sibling = current.sibling;
		workInProgress.index = current.index;
		workInProgress.ref = current.ref;
		workInProgress.refCleanup = current.refCleanup;
		return workInProgress;
	}
	function resetWorkInProgress(workInProgress, renderLanes) {
		workInProgress.flags &= 65011714;
		var current = workInProgress.alternate;
		null === current ? (workInProgress.childLanes = 0, workInProgress.lanes = renderLanes, workInProgress.child = null, workInProgress.subtreeFlags = 0, workInProgress.memoizedProps = null, workInProgress.memoizedState = null, workInProgress.updateQueue = null, workInProgress.dependencies = null, workInProgress.stateNode = null) : (workInProgress.childLanes = current.childLanes, workInProgress.lanes = current.lanes, workInProgress.child = current.child, workInProgress.subtreeFlags = 0, workInProgress.deletions = null, workInProgress.memoizedProps = current.memoizedProps, workInProgress.memoizedState = current.memoizedState, workInProgress.updateQueue = current.updateQueue, workInProgress.type = current.type, renderLanes = current.dependencies, workInProgress.dependencies = null === renderLanes ? null : {
			lanes: renderLanes.lanes,
			firstContext: renderLanes.firstContext
		});
		return workInProgress;
	}
	function createFiberFromTypeAndProps(type, key, pendingProps, owner, mode, lanes) {
		var fiberTag = 0;
		owner = type;
		if ("function" === typeof type) shouldConstruct(type) && (fiberTag = 1);
		else if ("string" === typeof type) fiberTag = isHostHoistableType(type, pendingProps, contextStackCursor.current) ? 26 : "html" === type || "head" === type || "body" === type ? 27 : 5;
		else a: switch (type) {
			case REACT_ACTIVITY_TYPE: return type = createFiberImplClass(31, pendingProps, key, mode), type.elementType = REACT_ACTIVITY_TYPE, type.lanes = lanes, type;
			case REACT_FRAGMENT_TYPE: return createFiberFromFragment(pendingProps.children, mode, lanes, key);
			case REACT_STRICT_MODE_TYPE:
				fiberTag = 8;
				mode |= 24;
				break;
			case REACT_PROFILER_TYPE: return type = createFiberImplClass(12, pendingProps, key, mode | 2), type.elementType = REACT_PROFILER_TYPE, type.lanes = lanes, type;
			case REACT_SUSPENSE_TYPE: return type = createFiberImplClass(13, pendingProps, key, mode), type.elementType = REACT_SUSPENSE_TYPE, type.lanes = lanes, type;
			case REACT_SUSPENSE_LIST_TYPE: return type = createFiberImplClass(19, pendingProps, key, mode), type.elementType = REACT_SUSPENSE_LIST_TYPE, type.lanes = lanes, type;
			default:
				if ("object" === typeof type && null !== type) switch (type.$$typeof) {
					case REACT_CONTEXT_TYPE:
						fiberTag = 10;
						break a;
					case REACT_CONSUMER_TYPE:
						fiberTag = 9;
						break a;
					case REACT_FORWARD_REF_TYPE:
						fiberTag = 11;
						break a;
					case REACT_MEMO_TYPE:
						fiberTag = 14;
						break a;
					case REACT_LAZY_TYPE:
						fiberTag = 16;
						owner = null;
						break a;
				}
				fiberTag = 29;
				pendingProps = Error(formatProdErrorMessage(130, null === type ? "null" : typeof type, ""));
				owner = null;
		}
		key = createFiberImplClass(fiberTag, pendingProps, key, mode);
		key.elementType = type;
		key.type = owner;
		key.lanes = lanes;
		return key;
	}
	function createFiberFromFragment(elements, mode, lanes, key) {
		elements = createFiberImplClass(7, elements, key, mode);
		elements.lanes = lanes;
		return elements;
	}
	function createFiberFromText(content, mode, lanes) {
		content = createFiberImplClass(6, content, null, mode);
		content.lanes = lanes;
		return content;
	}
	function createFiberFromDehydratedFragment(dehydratedNode) {
		var fiber = createFiberImplClass(18, null, null, 0);
		fiber.stateNode = dehydratedNode;
		return fiber;
	}
	function createFiberFromPortal(portal, mode, lanes) {
		mode = createFiberImplClass(4, null !== portal.children ? portal.children : [], portal.key, mode);
		mode.lanes = lanes;
		mode.stateNode = {
			containerInfo: portal.containerInfo,
			pendingChildren: null,
			implementation: portal.implementation
		};
		return mode;
	}
	var CapturedStacks = /* @__PURE__ */ new WeakMap();
	function createCapturedValueAtFiber(value, source) {
		if ("object" === typeof value && null !== value) {
			var existing = CapturedStacks.get(value);
			if (void 0 !== existing) return existing;
			source = {
				value,
				source,
				stack: getStackByFiberInDevAndProd(source)
			};
			CapturedStacks.set(value, source);
			return source;
		}
		return {
			value,
			source,
			stack: getStackByFiberInDevAndProd(source)
		};
	}
	var forkStack = [], forkStackIndex = 0, treeForkProvider = null, treeForkCount = 0, idStack = [], idStackIndex = 0, treeContextProvider = null, treeContextId = 1, treeContextOverflow = "";
	function pushTreeFork(workInProgress, totalChildren) {
		forkStack[forkStackIndex++] = treeForkCount;
		forkStack[forkStackIndex++] = treeForkProvider;
		treeForkProvider = workInProgress;
		treeForkCount = totalChildren;
	}
	function pushTreeId(workInProgress, totalChildren, index) {
		idStack[idStackIndex++] = treeContextId;
		idStack[idStackIndex++] = treeContextOverflow;
		idStack[idStackIndex++] = treeContextProvider;
		treeContextProvider = workInProgress;
		var baseIdWithLeadingBit = treeContextId;
		workInProgress = treeContextOverflow;
		var baseLength = 32 - clz32(baseIdWithLeadingBit) - 1;
		baseIdWithLeadingBit &= ~(1 << baseLength);
		index += 1;
		var length = 32 - clz32(totalChildren) + baseLength;
		if (30 < length) {
			var numberOfOverflowBits = baseLength - baseLength % 5;
			length = (baseIdWithLeadingBit & (1 << numberOfOverflowBits) - 1).toString(32);
			baseIdWithLeadingBit >>= numberOfOverflowBits;
			baseLength -= numberOfOverflowBits;
			treeContextId = 1 << 32 - clz32(totalChildren) + baseLength | index << baseLength | baseIdWithLeadingBit;
			treeContextOverflow = length + workInProgress;
		} else treeContextId = 1 << length | index << baseLength | baseIdWithLeadingBit, treeContextOverflow = workInProgress;
	}
	function pushMaterializedTreeId(workInProgress) {
		null !== workInProgress.return && (pushTreeFork(workInProgress, 1), pushTreeId(workInProgress, 1, 0));
	}
	function popTreeContext(workInProgress) {
		for (; workInProgress === treeForkProvider;) treeForkProvider = forkStack[--forkStackIndex], forkStack[forkStackIndex] = null, treeForkCount = forkStack[--forkStackIndex], forkStack[forkStackIndex] = null;
		for (; workInProgress === treeContextProvider;) treeContextProvider = idStack[--idStackIndex], idStack[idStackIndex] = null, treeContextOverflow = idStack[--idStackIndex], idStack[idStackIndex] = null, treeContextId = idStack[--idStackIndex], idStack[idStackIndex] = null;
	}
	function restoreSuspendedTreeContext(workInProgress, suspendedContext) {
		idStack[idStackIndex++] = treeContextId;
		idStack[idStackIndex++] = treeContextOverflow;
		idStack[idStackIndex++] = treeContextProvider;
		treeContextId = suspendedContext.id;
		treeContextOverflow = suspendedContext.overflow;
		treeContextProvider = workInProgress;
	}
	var hydrationParentFiber = null, nextHydratableInstance = null, isHydrating = !1, hydrationErrors = null, rootOrSingletonContext = !1, HydrationMismatchException = Error(formatProdErrorMessage(519));
	function throwOnHydrationMismatch(fiber) {
		queueHydrationError(createCapturedValueAtFiber(Error(formatProdErrorMessage(418, 1 < arguments.length && void 0 !== arguments[1] && arguments[1] ? "text" : "HTML", "")), fiber));
		throw HydrationMismatchException;
	}
	function prepareToHydrateHostInstance(fiber) {
		var instance = fiber.stateNode, type = fiber.type, props = fiber.memoizedProps;
		instance[internalInstanceKey] = fiber;
		instance[internalPropsKey] = props;
		switch (type) {
			case "dialog":
				listenToNonDelegatedEvent("cancel", instance);
				listenToNonDelegatedEvent("close", instance);
				break;
			case "iframe":
			case "object":
			case "embed":
				listenToNonDelegatedEvent("load", instance);
				break;
			case "video":
			case "audio":
				for (type = 0; type < mediaEventTypes.length; type++) listenToNonDelegatedEvent(mediaEventTypes[type], instance);
				break;
			case "source":
				listenToNonDelegatedEvent("error", instance);
				break;
			case "img":
			case "image":
			case "link":
				listenToNonDelegatedEvent("error", instance);
				listenToNonDelegatedEvent("load", instance);
				break;
			case "details":
				listenToNonDelegatedEvent("toggle", instance);
				break;
			case "input":
				listenToNonDelegatedEvent("invalid", instance);
				initInput(instance, props.value, props.defaultValue, props.checked, props.defaultChecked, props.type, props.name, !0);
				break;
			case "select":
				listenToNonDelegatedEvent("invalid", instance);
				break;
			case "textarea": listenToNonDelegatedEvent("invalid", instance), initTextarea(instance, props.value, props.defaultValue, props.children);
		}
		type = props.children;
		"string" !== typeof type && "number" !== typeof type && "bigint" !== typeof type || instance.textContent === "" + type || !0 === props.suppressHydrationWarning || checkForUnmatchedText(instance.textContent, type) ? (null != props.popover && (listenToNonDelegatedEvent("beforetoggle", instance), listenToNonDelegatedEvent("toggle", instance)), null != props.onScroll && listenToNonDelegatedEvent("scroll", instance), null != props.onScrollEnd && listenToNonDelegatedEvent("scrollend", instance), null != props.onClick && (instance.onclick = noop$1), instance = !0) : instance = !1;
		instance || throwOnHydrationMismatch(fiber, !0);
	}
	function popToNextHostParent(fiber) {
		for (hydrationParentFiber = fiber.return; hydrationParentFiber;) switch (hydrationParentFiber.tag) {
			case 5:
			case 31:
			case 13:
				rootOrSingletonContext = !1;
				return;
			case 27:
			case 3:
				rootOrSingletonContext = !0;
				return;
			default: hydrationParentFiber = hydrationParentFiber.return;
		}
	}
	function popHydrationState(fiber) {
		if (fiber !== hydrationParentFiber) return !1;
		if (!isHydrating) return popToNextHostParent(fiber), isHydrating = !0, !1;
		var tag = fiber.tag, JSCompiler_temp;
		if (JSCompiler_temp = 3 !== tag && 27 !== tag) {
			if (JSCompiler_temp = 5 === tag) JSCompiler_temp = fiber.type, JSCompiler_temp = !("form" !== JSCompiler_temp && "button" !== JSCompiler_temp) || shouldSetTextContent(fiber.type, fiber.memoizedProps);
			JSCompiler_temp = !JSCompiler_temp;
		}
		JSCompiler_temp && nextHydratableInstance && throwOnHydrationMismatch(fiber);
		popToNextHostParent(fiber);
		if (13 === tag) {
			fiber = fiber.memoizedState;
			fiber = null !== fiber ? fiber.dehydrated : null;
			if (!fiber) throw Error(formatProdErrorMessage(317));
			nextHydratableInstance = getNextHydratableInstanceAfterHydrationBoundary(fiber);
		} else if (31 === tag) {
			fiber = fiber.memoizedState;
			fiber = null !== fiber ? fiber.dehydrated : null;
			if (!fiber) throw Error(formatProdErrorMessage(317));
			nextHydratableInstance = getNextHydratableInstanceAfterHydrationBoundary(fiber);
		} else 27 === tag ? (tag = nextHydratableInstance, isSingletonScope(fiber.type) ? (fiber = previousHydratableOnEnteringScopedSingleton, previousHydratableOnEnteringScopedSingleton = null, nextHydratableInstance = fiber) : nextHydratableInstance = tag) : nextHydratableInstance = hydrationParentFiber ? getNextHydratable(fiber.stateNode.nextSibling) : null;
		return !0;
	}
	function resetHydrationState() {
		nextHydratableInstance = hydrationParentFiber = null;
		isHydrating = !1;
	}
	function upgradeHydrationErrorsToRecoverable() {
		var queuedErrors = hydrationErrors;
		null !== queuedErrors && (null === workInProgressRootRecoverableErrors ? workInProgressRootRecoverableErrors = queuedErrors : workInProgressRootRecoverableErrors.push.apply(workInProgressRootRecoverableErrors, queuedErrors), hydrationErrors = null);
		return queuedErrors;
	}
	function queueHydrationError(error) {
		null === hydrationErrors ? hydrationErrors = [error] : hydrationErrors.push(error);
	}
	var valueCursor = createCursor(null), currentlyRenderingFiber$1 = null, lastContextDependency = null;
	function pushProvider(providerFiber, context, nextValue) {
		push(valueCursor, context._currentValue);
		context._currentValue = nextValue;
	}
	function popProvider(context) {
		context._currentValue = valueCursor.current;
		pop(valueCursor);
	}
	function scheduleContextWorkOnParentPath(parent, renderLanes, propagationRoot) {
		for (; null !== parent;) {
			var alternate = parent.alternate;
			(parent.childLanes & renderLanes) !== renderLanes ? (parent.childLanes |= renderLanes, null !== alternate && (alternate.childLanes |= renderLanes)) : null !== alternate && (alternate.childLanes & renderLanes) !== renderLanes && (alternate.childLanes |= renderLanes);
			if (parent === propagationRoot) break;
			parent = parent.return;
		}
	}
	function propagateContextChanges(workInProgress, contexts, renderLanes, forcePropagateEntireTree) {
		var fiber = workInProgress.child;
		null !== fiber && (fiber.return = workInProgress);
		for (; null !== fiber;) {
			var list = fiber.dependencies;
			if (null !== list) {
				var nextFiber = fiber.child;
				list = list.firstContext;
				a: for (; null !== list;) {
					var dependency = list;
					list = fiber;
					for (var i = 0; i < contexts.length; i++) if (dependency.context === contexts[i]) {
						list.lanes |= renderLanes;
						dependency = list.alternate;
						null !== dependency && (dependency.lanes |= renderLanes);
						scheduleContextWorkOnParentPath(list.return, renderLanes, workInProgress);
						forcePropagateEntireTree || (nextFiber = null);
						break a;
					}
					list = dependency.next;
				}
			} else if (18 === fiber.tag) {
				nextFiber = fiber.return;
				if (null === nextFiber) throw Error(formatProdErrorMessage(341));
				nextFiber.lanes |= renderLanes;
				list = nextFiber.alternate;
				null !== list && (list.lanes |= renderLanes);
				scheduleContextWorkOnParentPath(nextFiber, renderLanes, workInProgress);
				nextFiber = null;
			} else nextFiber = fiber.child;
			if (null !== nextFiber) nextFiber.return = fiber;
			else for (nextFiber = fiber; null !== nextFiber;) {
				if (nextFiber === workInProgress) {
					nextFiber = null;
					break;
				}
				fiber = nextFiber.sibling;
				if (null !== fiber) {
					fiber.return = nextFiber.return;
					nextFiber = fiber;
					break;
				}
				nextFiber = nextFiber.return;
			}
			fiber = nextFiber;
		}
	}
	function propagateParentContextChanges(current, workInProgress, renderLanes, forcePropagateEntireTree) {
		current = null;
		for (var parent = workInProgress, isInsidePropagationBailout = !1; null !== parent;) {
			if (!isInsidePropagationBailout) {
				if (0 !== (parent.flags & 524288)) isInsidePropagationBailout = !0;
				else if (0 !== (parent.flags & 262144)) break;
			}
			if (10 === parent.tag) {
				var currentParent = parent.alternate;
				if (null === currentParent) throw Error(formatProdErrorMessage(387));
				currentParent = currentParent.memoizedProps;
				if (null !== currentParent) {
					var context = parent.type;
					objectIs(parent.pendingProps.value, currentParent.value) || (null !== current ? current.push(context) : current = [context]);
				}
			} else if (parent === hostTransitionProviderCursor.current) {
				currentParent = parent.alternate;
				if (null === currentParent) throw Error(formatProdErrorMessage(387));
				currentParent.memoizedState.memoizedState !== parent.memoizedState.memoizedState && (null !== current ? current.push(HostTransitionContext) : current = [HostTransitionContext]);
			}
			parent = parent.return;
		}
		null !== current && propagateContextChanges(workInProgress, current, renderLanes, forcePropagateEntireTree);
		workInProgress.flags |= 262144;
	}
	function checkIfContextChanged(currentDependencies) {
		for (currentDependencies = currentDependencies.firstContext; null !== currentDependencies;) {
			if (!objectIs(currentDependencies.context._currentValue, currentDependencies.memoizedValue)) return !0;
			currentDependencies = currentDependencies.next;
		}
		return !1;
	}
	function prepareToReadContext(workInProgress) {
		currentlyRenderingFiber$1 = workInProgress;
		lastContextDependency = null;
		workInProgress = workInProgress.dependencies;
		null !== workInProgress && (workInProgress.firstContext = null);
	}
	function readContext(context) {
		return readContextForConsumer(currentlyRenderingFiber$1, context);
	}
	function readContextDuringReconciliation(consumer, context) {
		null === currentlyRenderingFiber$1 && prepareToReadContext(consumer);
		return readContextForConsumer(consumer, context);
	}
	function readContextForConsumer(consumer, context) {
		var value = context._currentValue;
		context = {
			context,
			memoizedValue: value,
			next: null
		};
		if (null === lastContextDependency) {
			if (null === consumer) throw Error(formatProdErrorMessage(308));
			lastContextDependency = context;
			consumer.dependencies = {
				lanes: 0,
				firstContext: context
			};
			consumer.flags |= 524288;
		} else lastContextDependency = lastContextDependency.next = context;
		return value;
	}
	var AbortControllerLocal = "undefined" !== typeof AbortController ? AbortController : function() {
		var listeners = [], signal = this.signal = {
			aborted: !1,
			addEventListener: function(type, listener) {
				listeners.push(listener);
			}
		};
		this.abort = function() {
			signal.aborted = !0;
			listeners.forEach(function(listener) {
				return listener();
			});
		};
	}, scheduleCallback$2 = Scheduler.unstable_scheduleCallback, NormalPriority = Scheduler.unstable_NormalPriority, CacheContext = {
		$$typeof: REACT_CONTEXT_TYPE,
		Consumer: null,
		Provider: null,
		_currentValue: null,
		_currentValue2: null,
		_threadCount: 0
	};
	function createCache() {
		return {
			controller: new AbortControllerLocal(),
			data: /* @__PURE__ */ new Map(),
			refCount: 0
		};
	}
	function releaseCache(cache) {
		cache.refCount--;
		0 === cache.refCount && scheduleCallback$2(NormalPriority, function() {
			cache.controller.abort();
		});
	}
	var currentEntangledListeners = null, currentEntangledPendingCount = 0, currentEntangledLane = 0, currentEntangledActionThenable = null;
	function entangleAsyncAction(transition, thenable) {
		if (null === currentEntangledListeners) {
			var entangledListeners = currentEntangledListeners = [];
			currentEntangledPendingCount = 0;
			currentEntangledLane = requestTransitionLane();
			currentEntangledActionThenable = {
				status: "pending",
				value: void 0,
				then: function(resolve) {
					entangledListeners.push(resolve);
				}
			};
		}
		currentEntangledPendingCount++;
		thenable.then(pingEngtangledActionScope, pingEngtangledActionScope);
		return thenable;
	}
	function pingEngtangledActionScope() {
		if (0 === --currentEntangledPendingCount && null !== currentEntangledListeners) {
			null !== currentEntangledActionThenable && (currentEntangledActionThenable.status = "fulfilled");
			var listeners = currentEntangledListeners;
			currentEntangledListeners = null;
			currentEntangledLane = 0;
			currentEntangledActionThenable = null;
			for (var i = 0; i < listeners.length; i++) (0, listeners[i])();
		}
	}
	function chainThenableValue(thenable, result) {
		var listeners = [], thenableWithOverride = {
			status: "pending",
			value: null,
			reason: null,
			then: function(resolve) {
				listeners.push(resolve);
			}
		};
		thenable.then(function() {
			thenableWithOverride.status = "fulfilled";
			thenableWithOverride.value = result;
			for (var i = 0; i < listeners.length; i++) (0, listeners[i])(result);
		}, function(error) {
			thenableWithOverride.status = "rejected";
			thenableWithOverride.reason = error;
			for (error = 0; error < listeners.length; error++) (0, listeners[error])(void 0);
		});
		return thenableWithOverride;
	}
	var prevOnStartTransitionFinish = ReactSharedInternals.S;
	ReactSharedInternals.S = function(transition, returnValue) {
		globalMostRecentTransitionTime = now();
		"object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && entangleAsyncAction(transition, returnValue);
		null !== prevOnStartTransitionFinish && prevOnStartTransitionFinish(transition, returnValue);
	};
	var resumedCache = createCursor(null);
	function peekCacheFromPool() {
		var cacheResumedFromPreviousRender = resumedCache.current;
		return null !== cacheResumedFromPreviousRender ? cacheResumedFromPreviousRender : workInProgressRoot.pooledCache;
	}
	function pushTransition(offscreenWorkInProgress, prevCachePool) {
		null === prevCachePool ? push(resumedCache, resumedCache.current) : push(resumedCache, prevCachePool.pool);
	}
	function getSuspendedCache() {
		var cacheFromPool = peekCacheFromPool();
		return null === cacheFromPool ? null : {
			parent: CacheContext._currentValue,
			pool: cacheFromPool
		};
	}
	var SuspenseException = Error(formatProdErrorMessage(460)), SuspenseyCommitException = Error(formatProdErrorMessage(474)), SuspenseActionException = Error(formatProdErrorMessage(542)), noopSuspenseyCommitThenable = { then: function() {} };
	function isThenableResolved(thenable) {
		thenable = thenable.status;
		return "fulfilled" === thenable || "rejected" === thenable;
	}
	function trackUsedThenable(thenableState, thenable, index) {
		index = thenableState[index];
		void 0 === index ? thenableState.push(thenable) : index !== thenable && (thenable.then(noop$1, noop$1), thenable = index);
		switch (thenable.status) {
			case "fulfilled": return thenable.value;
			case "rejected": throw thenableState = thenable.reason, checkIfUseWrappedInAsyncCatch(thenableState), thenableState;
			default:
				if ("string" === typeof thenable.status) thenable.then(noop$1, noop$1);
				else {
					thenableState = workInProgressRoot;
					if (null !== thenableState && 100 < thenableState.shellSuspendCounter) throw Error(formatProdErrorMessage(482));
					thenableState = thenable;
					thenableState.status = "pending";
					thenableState.then(function(fulfilledValue) {
						if ("pending" === thenable.status) {
							var fulfilledThenable = thenable;
							fulfilledThenable.status = "fulfilled";
							fulfilledThenable.value = fulfilledValue;
						}
					}, function(error) {
						if ("pending" === thenable.status) {
							var rejectedThenable = thenable;
							rejectedThenable.status = "rejected";
							rejectedThenable.reason = error;
						}
					});
				}
				switch (thenable.status) {
					case "fulfilled": return thenable.value;
					case "rejected": throw thenableState = thenable.reason, checkIfUseWrappedInAsyncCatch(thenableState), thenableState;
				}
				suspendedThenable = thenable;
				throw SuspenseException;
		}
	}
	function resolveLazy(lazyType) {
		try {
			var init = lazyType._init;
			return init(lazyType._payload);
		} catch (x) {
			if (null !== x && "object" === typeof x && "function" === typeof x.then) throw suspendedThenable = x, SuspenseException;
			throw x;
		}
	}
	var suspendedThenable = null;
	function getSuspendedThenable() {
		if (null === suspendedThenable) throw Error(formatProdErrorMessage(459));
		var thenable = suspendedThenable;
		suspendedThenable = null;
		return thenable;
	}
	function checkIfUseWrappedInAsyncCatch(rejectedReason) {
		if (rejectedReason === SuspenseException || rejectedReason === SuspenseActionException) throw Error(formatProdErrorMessage(483));
	}
	var thenableState$1 = null, thenableIndexCounter$1 = 0;
	function unwrapThenable(thenable) {
		var index = thenableIndexCounter$1;
		thenableIndexCounter$1 += 1;
		null === thenableState$1 && (thenableState$1 = []);
		return trackUsedThenable(thenableState$1, thenable, index);
	}
	function coerceRef(workInProgress, element) {
		element = element.props.ref;
		workInProgress.ref = void 0 !== element ? element : null;
	}
	function throwOnInvalidObjectTypeImpl(returnFiber, newChild) {
		if (newChild.$$typeof === REACT_LEGACY_ELEMENT_TYPE) throw Error(formatProdErrorMessage(525));
		returnFiber = Object.prototype.toString.call(newChild);
		throw Error(formatProdErrorMessage(31, "[object Object]" === returnFiber ? "object with keys {" + Object.keys(newChild).join(", ") + "}" : returnFiber));
	}
	function createChildReconciler(shouldTrackSideEffects) {
		function deleteChild(returnFiber, childToDelete) {
			if (shouldTrackSideEffects) {
				var deletions = returnFiber.deletions;
				null === deletions ? (returnFiber.deletions = [childToDelete], returnFiber.flags |= 16) : deletions.push(childToDelete);
			}
		}
		function deleteRemainingChildren(returnFiber, currentFirstChild) {
			if (!shouldTrackSideEffects) return null;
			for (; null !== currentFirstChild;) deleteChild(returnFiber, currentFirstChild), currentFirstChild = currentFirstChild.sibling;
			return null;
		}
		function mapRemainingChildren(currentFirstChild) {
			for (var existingChildren = /* @__PURE__ */ new Map(); null !== currentFirstChild;) null !== currentFirstChild.key ? existingChildren.set(currentFirstChild.key, currentFirstChild) : existingChildren.set(currentFirstChild.index, currentFirstChild), currentFirstChild = currentFirstChild.sibling;
			return existingChildren;
		}
		function useFiber(fiber, pendingProps) {
			fiber = createWorkInProgress(fiber, pendingProps);
			fiber.index = 0;
			fiber.sibling = null;
			return fiber;
		}
		function placeChild(newFiber, lastPlacedIndex, newIndex) {
			newFiber.index = newIndex;
			if (!shouldTrackSideEffects) return newFiber.flags |= 1048576, lastPlacedIndex;
			newIndex = newFiber.alternate;
			if (null !== newIndex) return newIndex = newIndex.index, newIndex < lastPlacedIndex ? (newFiber.flags |= 67108866, lastPlacedIndex) : newIndex;
			newFiber.flags |= 67108866;
			return lastPlacedIndex;
		}
		function placeSingleChild(newFiber) {
			shouldTrackSideEffects && null === newFiber.alternate && (newFiber.flags |= 67108866);
			return newFiber;
		}
		function updateTextNode(returnFiber, current, textContent, lanes) {
			if (null === current || 6 !== current.tag) return current = createFiberFromText(textContent, returnFiber.mode, lanes), current.return = returnFiber, current;
			current = useFiber(current, textContent);
			current.return = returnFiber;
			return current;
		}
		function updateElement(returnFiber, current, element, lanes) {
			var elementType = element.type;
			if (elementType === REACT_FRAGMENT_TYPE) return updateFragment(returnFiber, current, element.props.children, lanes, element.key);
			if (null !== current && (current.elementType === elementType || "object" === typeof elementType && null !== elementType && elementType.$$typeof === REACT_LAZY_TYPE && resolveLazy(elementType) === current.type)) return current = useFiber(current, element.props), coerceRef(current, element), current.return = returnFiber, current;
			current = createFiberFromTypeAndProps(element.type, element.key, element.props, null, returnFiber.mode, lanes);
			coerceRef(current, element);
			current.return = returnFiber;
			return current;
		}
		function updatePortal(returnFiber, current, portal, lanes) {
			if (null === current || 4 !== current.tag || current.stateNode.containerInfo !== portal.containerInfo || current.stateNode.implementation !== portal.implementation) return current = createFiberFromPortal(portal, returnFiber.mode, lanes), current.return = returnFiber, current;
			current = useFiber(current, portal.children || []);
			current.return = returnFiber;
			return current;
		}
		function updateFragment(returnFiber, current, fragment, lanes, key) {
			if (null === current || 7 !== current.tag) return current = createFiberFromFragment(fragment, returnFiber.mode, lanes, key), current.return = returnFiber, current;
			current = useFiber(current, fragment);
			current.return = returnFiber;
			return current;
		}
		function createChild(returnFiber, newChild, lanes) {
			if ("string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild) return newChild = createFiberFromText("" + newChild, returnFiber.mode, lanes), newChild.return = returnFiber, newChild;
			if ("object" === typeof newChild && null !== newChild) {
				switch (newChild.$$typeof) {
					case REACT_ELEMENT_TYPE: return lanes = createFiberFromTypeAndProps(newChild.type, newChild.key, newChild.props, null, returnFiber.mode, lanes), coerceRef(lanes, newChild), lanes.return = returnFiber, lanes;
					case REACT_PORTAL_TYPE: return newChild = createFiberFromPortal(newChild, returnFiber.mode, lanes), newChild.return = returnFiber, newChild;
					case REACT_LAZY_TYPE: return newChild = resolveLazy(newChild), createChild(returnFiber, newChild, lanes);
				}
				if (isArrayImpl(newChild) || getIteratorFn(newChild)) return newChild = createFiberFromFragment(newChild, returnFiber.mode, lanes, null), newChild.return = returnFiber, newChild;
				if ("function" === typeof newChild.then) return createChild(returnFiber, unwrapThenable(newChild), lanes);
				if (newChild.$$typeof === REACT_CONTEXT_TYPE) return createChild(returnFiber, readContextDuringReconciliation(returnFiber, newChild), lanes);
				throwOnInvalidObjectTypeImpl(returnFiber, newChild);
			}
			return null;
		}
		function updateSlot(returnFiber, oldFiber, newChild, lanes) {
			var key = null !== oldFiber ? oldFiber.key : null;
			if ("string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild) return null !== key ? null : updateTextNode(returnFiber, oldFiber, "" + newChild, lanes);
			if ("object" === typeof newChild && null !== newChild) {
				switch (newChild.$$typeof) {
					case REACT_ELEMENT_TYPE: return newChild.key === key ? updateElement(returnFiber, oldFiber, newChild, lanes) : null;
					case REACT_PORTAL_TYPE: return newChild.key === key ? updatePortal(returnFiber, oldFiber, newChild, lanes) : null;
					case REACT_LAZY_TYPE: return newChild = resolveLazy(newChild), updateSlot(returnFiber, oldFiber, newChild, lanes);
				}
				if (isArrayImpl(newChild) || getIteratorFn(newChild)) return null !== key ? null : updateFragment(returnFiber, oldFiber, newChild, lanes, null);
				if ("function" === typeof newChild.then) return updateSlot(returnFiber, oldFiber, unwrapThenable(newChild), lanes);
				if (newChild.$$typeof === REACT_CONTEXT_TYPE) return updateSlot(returnFiber, oldFiber, readContextDuringReconciliation(returnFiber, newChild), lanes);
				throwOnInvalidObjectTypeImpl(returnFiber, newChild);
			}
			return null;
		}
		function updateFromMap(existingChildren, returnFiber, newIdx, newChild, lanes) {
			if ("string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild) return existingChildren = existingChildren.get(newIdx) || null, updateTextNode(returnFiber, existingChildren, "" + newChild, lanes);
			if ("object" === typeof newChild && null !== newChild) {
				switch (newChild.$$typeof) {
					case REACT_ELEMENT_TYPE: return existingChildren = existingChildren.get(null === newChild.key ? newIdx : newChild.key) || null, updateElement(returnFiber, existingChildren, newChild, lanes);
					case REACT_PORTAL_TYPE: return existingChildren = existingChildren.get(null === newChild.key ? newIdx : newChild.key) || null, updatePortal(returnFiber, existingChildren, newChild, lanes);
					case REACT_LAZY_TYPE: return newChild = resolveLazy(newChild), updateFromMap(existingChildren, returnFiber, newIdx, newChild, lanes);
				}
				if (isArrayImpl(newChild) || getIteratorFn(newChild)) return existingChildren = existingChildren.get(newIdx) || null, updateFragment(returnFiber, existingChildren, newChild, lanes, null);
				if ("function" === typeof newChild.then) return updateFromMap(existingChildren, returnFiber, newIdx, unwrapThenable(newChild), lanes);
				if (newChild.$$typeof === REACT_CONTEXT_TYPE) return updateFromMap(existingChildren, returnFiber, newIdx, readContextDuringReconciliation(returnFiber, newChild), lanes);
				throwOnInvalidObjectTypeImpl(returnFiber, newChild);
			}
			return null;
		}
		function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren, lanes) {
			for (var resultingFirstChild = null, previousNewFiber = null, oldFiber = currentFirstChild, newIdx = currentFirstChild = 0, nextOldFiber = null; null !== oldFiber && newIdx < newChildren.length; newIdx++) {
				oldFiber.index > newIdx ? (nextOldFiber = oldFiber, oldFiber = null) : nextOldFiber = oldFiber.sibling;
				var newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIdx], lanes);
				if (null === newFiber) {
					null === oldFiber && (oldFiber = nextOldFiber);
					break;
				}
				shouldTrackSideEffects && oldFiber && null === newFiber.alternate && deleteChild(returnFiber, oldFiber);
				currentFirstChild = placeChild(newFiber, currentFirstChild, newIdx);
				null === previousNewFiber ? resultingFirstChild = newFiber : previousNewFiber.sibling = newFiber;
				previousNewFiber = newFiber;
				oldFiber = nextOldFiber;
			}
			if (newIdx === newChildren.length) return deleteRemainingChildren(returnFiber, oldFiber), isHydrating && pushTreeFork(returnFiber, newIdx), resultingFirstChild;
			if (null === oldFiber) {
				for (; newIdx < newChildren.length; newIdx++) oldFiber = createChild(returnFiber, newChildren[newIdx], lanes), null !== oldFiber && (currentFirstChild = placeChild(oldFiber, currentFirstChild, newIdx), null === previousNewFiber ? resultingFirstChild = oldFiber : previousNewFiber.sibling = oldFiber, previousNewFiber = oldFiber);
				isHydrating && pushTreeFork(returnFiber, newIdx);
				return resultingFirstChild;
			}
			for (oldFiber = mapRemainingChildren(oldFiber); newIdx < newChildren.length; newIdx++) nextOldFiber = updateFromMap(oldFiber, returnFiber, newIdx, newChildren[newIdx], lanes), null !== nextOldFiber && (shouldTrackSideEffects && null !== nextOldFiber.alternate && oldFiber.delete(null === nextOldFiber.key ? newIdx : nextOldFiber.key), currentFirstChild = placeChild(nextOldFiber, currentFirstChild, newIdx), null === previousNewFiber ? resultingFirstChild = nextOldFiber : previousNewFiber.sibling = nextOldFiber, previousNewFiber = nextOldFiber);
			shouldTrackSideEffects && oldFiber.forEach(function(child) {
				return deleteChild(returnFiber, child);
			});
			isHydrating && pushTreeFork(returnFiber, newIdx);
			return resultingFirstChild;
		}
		function reconcileChildrenIterator(returnFiber, currentFirstChild, newChildren, lanes) {
			if (null == newChildren) throw Error(formatProdErrorMessage(151));
			for (var resultingFirstChild = null, previousNewFiber = null, oldFiber = currentFirstChild, newIdx = currentFirstChild = 0, nextOldFiber = null, step = newChildren.next(); null !== oldFiber && !step.done; newIdx++, step = newChildren.next()) {
				oldFiber.index > newIdx ? (nextOldFiber = oldFiber, oldFiber = null) : nextOldFiber = oldFiber.sibling;
				var newFiber = updateSlot(returnFiber, oldFiber, step.value, lanes);
				if (null === newFiber) {
					null === oldFiber && (oldFiber = nextOldFiber);
					break;
				}
				shouldTrackSideEffects && oldFiber && null === newFiber.alternate && deleteChild(returnFiber, oldFiber);
				currentFirstChild = placeChild(newFiber, currentFirstChild, newIdx);
				null === previousNewFiber ? resultingFirstChild = newFiber : previousNewFiber.sibling = newFiber;
				previousNewFiber = newFiber;
				oldFiber = nextOldFiber;
			}
			if (step.done) return deleteRemainingChildren(returnFiber, oldFiber), isHydrating && pushTreeFork(returnFiber, newIdx), resultingFirstChild;
			if (null === oldFiber) {
				for (; !step.done; newIdx++, step = newChildren.next()) step = createChild(returnFiber, step.value, lanes), null !== step && (currentFirstChild = placeChild(step, currentFirstChild, newIdx), null === previousNewFiber ? resultingFirstChild = step : previousNewFiber.sibling = step, previousNewFiber = step);
				isHydrating && pushTreeFork(returnFiber, newIdx);
				return resultingFirstChild;
			}
			for (oldFiber = mapRemainingChildren(oldFiber); !step.done; newIdx++, step = newChildren.next()) step = updateFromMap(oldFiber, returnFiber, newIdx, step.value, lanes), null !== step && (shouldTrackSideEffects && null !== step.alternate && oldFiber.delete(null === step.key ? newIdx : step.key), currentFirstChild = placeChild(step, currentFirstChild, newIdx), null === previousNewFiber ? resultingFirstChild = step : previousNewFiber.sibling = step, previousNewFiber = step);
			shouldTrackSideEffects && oldFiber.forEach(function(child) {
				return deleteChild(returnFiber, child);
			});
			isHydrating && pushTreeFork(returnFiber, newIdx);
			return resultingFirstChild;
		}
		function reconcileChildFibersImpl(returnFiber, currentFirstChild, newChild, lanes) {
			"object" === typeof newChild && null !== newChild && newChild.type === REACT_FRAGMENT_TYPE && null === newChild.key && (newChild = newChild.props.children);
			if ("object" === typeof newChild && null !== newChild) {
				switch (newChild.$$typeof) {
					case REACT_ELEMENT_TYPE:
						a: {
							for (var key = newChild.key; null !== currentFirstChild;) {
								if (currentFirstChild.key === key) {
									key = newChild.type;
									if (key === REACT_FRAGMENT_TYPE) {
										if (7 === currentFirstChild.tag) {
											deleteRemainingChildren(returnFiber, currentFirstChild.sibling);
											lanes = useFiber(currentFirstChild, newChild.props.children);
											lanes.return = returnFiber;
											returnFiber = lanes;
											break a;
										}
									} else if (currentFirstChild.elementType === key || "object" === typeof key && null !== key && key.$$typeof === REACT_LAZY_TYPE && resolveLazy(key) === currentFirstChild.type) {
										deleteRemainingChildren(returnFiber, currentFirstChild.sibling);
										lanes = useFiber(currentFirstChild, newChild.props);
										coerceRef(lanes, newChild);
										lanes.return = returnFiber;
										returnFiber = lanes;
										break a;
									}
									deleteRemainingChildren(returnFiber, currentFirstChild);
									break;
								} else deleteChild(returnFiber, currentFirstChild);
								currentFirstChild = currentFirstChild.sibling;
							}
							newChild.type === REACT_FRAGMENT_TYPE ? (lanes = createFiberFromFragment(newChild.props.children, returnFiber.mode, lanes, newChild.key), lanes.return = returnFiber, returnFiber = lanes) : (lanes = createFiberFromTypeAndProps(newChild.type, newChild.key, newChild.props, null, returnFiber.mode, lanes), coerceRef(lanes, newChild), lanes.return = returnFiber, returnFiber = lanes);
						}
						return placeSingleChild(returnFiber);
					case REACT_PORTAL_TYPE:
						a: {
							for (key = newChild.key; null !== currentFirstChild;) {
								if (currentFirstChild.key === key) if (4 === currentFirstChild.tag && currentFirstChild.stateNode.containerInfo === newChild.containerInfo && currentFirstChild.stateNode.implementation === newChild.implementation) {
									deleteRemainingChildren(returnFiber, currentFirstChild.sibling);
									lanes = useFiber(currentFirstChild, newChild.children || []);
									lanes.return = returnFiber;
									returnFiber = lanes;
									break a;
								} else {
									deleteRemainingChildren(returnFiber, currentFirstChild);
									break;
								}
								else deleteChild(returnFiber, currentFirstChild);
								currentFirstChild = currentFirstChild.sibling;
							}
							lanes = createFiberFromPortal(newChild, returnFiber.mode, lanes);
							lanes.return = returnFiber;
							returnFiber = lanes;
						}
						return placeSingleChild(returnFiber);
					case REACT_LAZY_TYPE: return newChild = resolveLazy(newChild), reconcileChildFibersImpl(returnFiber, currentFirstChild, newChild, lanes);
				}
				if (isArrayImpl(newChild)) return reconcileChildrenArray(returnFiber, currentFirstChild, newChild, lanes);
				if (getIteratorFn(newChild)) {
					key = getIteratorFn(newChild);
					if ("function" !== typeof key) throw Error(formatProdErrorMessage(150));
					newChild = key.call(newChild);
					return reconcileChildrenIterator(returnFiber, currentFirstChild, newChild, lanes);
				}
				if ("function" === typeof newChild.then) return reconcileChildFibersImpl(returnFiber, currentFirstChild, unwrapThenable(newChild), lanes);
				if (newChild.$$typeof === REACT_CONTEXT_TYPE) return reconcileChildFibersImpl(returnFiber, currentFirstChild, readContextDuringReconciliation(returnFiber, newChild), lanes);
				throwOnInvalidObjectTypeImpl(returnFiber, newChild);
			}
			return "string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild ? (newChild = "" + newChild, null !== currentFirstChild && 6 === currentFirstChild.tag ? (deleteRemainingChildren(returnFiber, currentFirstChild.sibling), lanes = useFiber(currentFirstChild, newChild), lanes.return = returnFiber, returnFiber = lanes) : (deleteRemainingChildren(returnFiber, currentFirstChild), lanes = createFiberFromText(newChild, returnFiber.mode, lanes), lanes.return = returnFiber, returnFiber = lanes), placeSingleChild(returnFiber)) : deleteRemainingChildren(returnFiber, currentFirstChild);
		}
		return function(returnFiber, currentFirstChild, newChild, lanes) {
			try {
				thenableIndexCounter$1 = 0;
				var firstChildFiber = reconcileChildFibersImpl(returnFiber, currentFirstChild, newChild, lanes);
				thenableState$1 = null;
				return firstChildFiber;
			} catch (x) {
				if (x === SuspenseException || x === SuspenseActionException) throw x;
				var fiber = createFiberImplClass(29, x, null, returnFiber.mode);
				fiber.lanes = lanes;
				fiber.return = returnFiber;
				return fiber;
			}
		};
	}
	var reconcileChildFibers = createChildReconciler(!0), mountChildFibers = createChildReconciler(!1), hasForceUpdate = !1;
	function initializeUpdateQueue(fiber) {
		fiber.updateQueue = {
			baseState: fiber.memoizedState,
			firstBaseUpdate: null,
			lastBaseUpdate: null,
			shared: {
				pending: null,
				lanes: 0,
				hiddenCallbacks: null
			},
			callbacks: null
		};
	}
	function cloneUpdateQueue(current, workInProgress) {
		current = current.updateQueue;
		workInProgress.updateQueue === current && (workInProgress.updateQueue = {
			baseState: current.baseState,
			firstBaseUpdate: current.firstBaseUpdate,
			lastBaseUpdate: current.lastBaseUpdate,
			shared: current.shared,
			callbacks: null
		});
	}
	function createUpdate(lane) {
		return {
			lane,
			tag: 0,
			payload: null,
			callback: null,
			next: null
		};
	}
	function enqueueUpdate(fiber, update, lane) {
		var updateQueue = fiber.updateQueue;
		if (null === updateQueue) return null;
		updateQueue = updateQueue.shared;
		if (0 !== (executionContext & 2)) {
			var pending = updateQueue.pending;
			null === pending ? update.next = update : (update.next = pending.next, pending.next = update);
			updateQueue.pending = update;
			update = getRootForUpdatedFiber(fiber);
			markUpdateLaneFromFiberToRoot(fiber, null, lane);
			return update;
		}
		enqueueUpdate$1(fiber, updateQueue, update, lane);
		return getRootForUpdatedFiber(fiber);
	}
	function entangleTransitions(root, fiber, lane) {
		fiber = fiber.updateQueue;
		if (null !== fiber && (fiber = fiber.shared, 0 !== (lane & 4194048))) {
			var queueLanes = fiber.lanes;
			queueLanes &= root.pendingLanes;
			lane |= queueLanes;
			fiber.lanes = lane;
			markRootEntangled(root, lane);
		}
	}
	function enqueueCapturedUpdate(workInProgress, capturedUpdate) {
		var queue = workInProgress.updateQueue, current = workInProgress.alternate;
		if (null !== current && (current = current.updateQueue, queue === current)) {
			var newFirst = null, newLast = null;
			queue = queue.firstBaseUpdate;
			if (null !== queue) {
				do {
					var clone = {
						lane: queue.lane,
						tag: queue.tag,
						payload: queue.payload,
						callback: null,
						next: null
					};
					null === newLast ? newFirst = newLast = clone : newLast = newLast.next = clone;
					queue = queue.next;
				} while (null !== queue);
				null === newLast ? newFirst = newLast = capturedUpdate : newLast = newLast.next = capturedUpdate;
			} else newFirst = newLast = capturedUpdate;
			queue = {
				baseState: current.baseState,
				firstBaseUpdate: newFirst,
				lastBaseUpdate: newLast,
				shared: current.shared,
				callbacks: current.callbacks
			};
			workInProgress.updateQueue = queue;
			return;
		}
		workInProgress = queue.lastBaseUpdate;
		null === workInProgress ? queue.firstBaseUpdate = capturedUpdate : workInProgress.next = capturedUpdate;
		queue.lastBaseUpdate = capturedUpdate;
	}
	var didReadFromEntangledAsyncAction = !1;
	function suspendIfUpdateReadFromEntangledAsyncAction() {
		if (didReadFromEntangledAsyncAction) {
			var entangledActionThenable = currentEntangledActionThenable;
			if (null !== entangledActionThenable) throw entangledActionThenable;
		}
	}
	function processUpdateQueue(workInProgress$jscomp$0, props, instance$jscomp$0, renderLanes) {
		didReadFromEntangledAsyncAction = !1;
		var queue = workInProgress$jscomp$0.updateQueue;
		hasForceUpdate = !1;
		var firstBaseUpdate = queue.firstBaseUpdate, lastBaseUpdate = queue.lastBaseUpdate, pendingQueue = queue.shared.pending;
		if (null !== pendingQueue) {
			queue.shared.pending = null;
			var lastPendingUpdate = pendingQueue, firstPendingUpdate = lastPendingUpdate.next;
			lastPendingUpdate.next = null;
			null === lastBaseUpdate ? firstBaseUpdate = firstPendingUpdate : lastBaseUpdate.next = firstPendingUpdate;
			lastBaseUpdate = lastPendingUpdate;
			var current = workInProgress$jscomp$0.alternate;
			null !== current && (current = current.updateQueue, pendingQueue = current.lastBaseUpdate, pendingQueue !== lastBaseUpdate && (null === pendingQueue ? current.firstBaseUpdate = firstPendingUpdate : pendingQueue.next = firstPendingUpdate, current.lastBaseUpdate = lastPendingUpdate));
		}
		if (null !== firstBaseUpdate) {
			var newState = queue.baseState;
			lastBaseUpdate = 0;
			current = firstPendingUpdate = lastPendingUpdate = null;
			pendingQueue = firstBaseUpdate;
			do {
				var updateLane = pendingQueue.lane & -536870913, isHiddenUpdate = updateLane !== pendingQueue.lane;
				if (isHiddenUpdate ? (workInProgressRootRenderLanes & updateLane) === updateLane : (renderLanes & updateLane) === updateLane) {
					0 !== updateLane && updateLane === currentEntangledLane && (didReadFromEntangledAsyncAction = !0);
					null !== current && (current = current.next = {
						lane: 0,
						tag: pendingQueue.tag,
						payload: pendingQueue.payload,
						callback: null,
						next: null
					});
					a: {
						var workInProgress = workInProgress$jscomp$0, update = pendingQueue;
						updateLane = props;
						var instance = instance$jscomp$0;
						switch (update.tag) {
							case 1:
								workInProgress = update.payload;
								if ("function" === typeof workInProgress) {
									newState = workInProgress.call(instance, newState, updateLane);
									break a;
								}
								newState = workInProgress;
								break a;
							case 3: workInProgress.flags = workInProgress.flags & -65537 | 128;
							case 0:
								workInProgress = update.payload;
								updateLane = "function" === typeof workInProgress ? workInProgress.call(instance, newState, updateLane) : workInProgress;
								if (null === updateLane || void 0 === updateLane) break a;
								newState = assign({}, newState, updateLane);
								break a;
							case 2: hasForceUpdate = !0;
						}
					}
					updateLane = pendingQueue.callback;
					null !== updateLane && (workInProgress$jscomp$0.flags |= 64, isHiddenUpdate && (workInProgress$jscomp$0.flags |= 8192), isHiddenUpdate = queue.callbacks, null === isHiddenUpdate ? queue.callbacks = [updateLane] : isHiddenUpdate.push(updateLane));
				} else isHiddenUpdate = {
					lane: updateLane,
					tag: pendingQueue.tag,
					payload: pendingQueue.payload,
					callback: pendingQueue.callback,
					next: null
				}, null === current ? (firstPendingUpdate = current = isHiddenUpdate, lastPendingUpdate = newState) : current = current.next = isHiddenUpdate, lastBaseUpdate |= updateLane;
				pendingQueue = pendingQueue.next;
				if (null === pendingQueue) if (pendingQueue = queue.shared.pending, null === pendingQueue) break;
				else isHiddenUpdate = pendingQueue, pendingQueue = isHiddenUpdate.next, isHiddenUpdate.next = null, queue.lastBaseUpdate = isHiddenUpdate, queue.shared.pending = null;
			} while (1);
			null === current && (lastPendingUpdate = newState);
			queue.baseState = lastPendingUpdate;
			queue.firstBaseUpdate = firstPendingUpdate;
			queue.lastBaseUpdate = current;
			null === firstBaseUpdate && (queue.shared.lanes = 0);
			workInProgressRootSkippedLanes |= lastBaseUpdate;
			workInProgress$jscomp$0.lanes = lastBaseUpdate;
			workInProgress$jscomp$0.memoizedState = newState;
		}
	}
	function callCallback(callback, context) {
		if ("function" !== typeof callback) throw Error(formatProdErrorMessage(191, callback));
		callback.call(context);
	}
	function commitCallbacks(updateQueue, context) {
		var callbacks = updateQueue.callbacks;
		if (null !== callbacks) for (updateQueue.callbacks = null, updateQueue = 0; updateQueue < callbacks.length; updateQueue++) callCallback(callbacks[updateQueue], context);
	}
	var currentTreeHiddenStackCursor = createCursor(null), prevEntangledRenderLanesCursor = createCursor(0);
	function pushHiddenContext(fiber, context) {
		fiber = entangledRenderLanes;
		push(prevEntangledRenderLanesCursor, fiber);
		push(currentTreeHiddenStackCursor, context);
		entangledRenderLanes = fiber | context.baseLanes;
	}
	function reuseHiddenContextOnStack() {
		push(prevEntangledRenderLanesCursor, entangledRenderLanes);
		push(currentTreeHiddenStackCursor, currentTreeHiddenStackCursor.current);
	}
	function popHiddenContext() {
		entangledRenderLanes = prevEntangledRenderLanesCursor.current;
		pop(currentTreeHiddenStackCursor);
		pop(prevEntangledRenderLanesCursor);
	}
	var suspenseHandlerStackCursor = createCursor(null), shellBoundary = null;
	function pushPrimaryTreeSuspenseHandler(handler) {
		var current = handler.alternate;
		push(suspenseStackCursor, suspenseStackCursor.current & 1);
		push(suspenseHandlerStackCursor, handler);
		null === shellBoundary && (null === current || null !== currentTreeHiddenStackCursor.current ? shellBoundary = handler : null !== current.memoizedState && (shellBoundary = handler));
	}
	function pushDehydratedActivitySuspenseHandler(fiber) {
		push(suspenseStackCursor, suspenseStackCursor.current);
		push(suspenseHandlerStackCursor, fiber);
		null === shellBoundary && (shellBoundary = fiber);
	}
	function pushOffscreenSuspenseHandler(fiber) {
		22 === fiber.tag ? (push(suspenseStackCursor, suspenseStackCursor.current), push(suspenseHandlerStackCursor, fiber), null === shellBoundary && (shellBoundary = fiber)) : reuseSuspenseHandlerOnStack(fiber);
	}
	function reuseSuspenseHandlerOnStack() {
		push(suspenseStackCursor, suspenseStackCursor.current);
		push(suspenseHandlerStackCursor, suspenseHandlerStackCursor.current);
	}
	function popSuspenseHandler(fiber) {
		pop(suspenseHandlerStackCursor);
		shellBoundary === fiber && (shellBoundary = null);
		pop(suspenseStackCursor);
	}
	var suspenseStackCursor = createCursor(0);
	function findFirstSuspended(row) {
		for (var node = row; null !== node;) {
			if (13 === node.tag) {
				var state = node.memoizedState;
				if (null !== state && (state = state.dehydrated, null === state || isSuspenseInstancePending(state) || isSuspenseInstanceFallback(state))) return node;
			} else if (19 === node.tag && ("forwards" === node.memoizedProps.revealOrder || "backwards" === node.memoizedProps.revealOrder || "unstable_legacy-backwards" === node.memoizedProps.revealOrder || "together" === node.memoizedProps.revealOrder)) {
				if (0 !== (node.flags & 128)) return node;
			} else if (null !== node.child) {
				node.child.return = node;
				node = node.child;
				continue;
			}
			if (node === row) break;
			for (; null === node.sibling;) {
				if (null === node.return || node.return === row) return null;
				node = node.return;
			}
			node.sibling.return = node.return;
			node = node.sibling;
		}
		return null;
	}
	var renderLanes = 0, currentlyRenderingFiber = null, currentHook = null, workInProgressHook = null, didScheduleRenderPhaseUpdate = !1, didScheduleRenderPhaseUpdateDuringThisPass = !1, shouldDoubleInvokeUserFnsInHooksDEV = !1, localIdCounter = 0, thenableIndexCounter = 0, thenableState = null, globalClientIdCounter = 0;
	function throwInvalidHookError() {
		throw Error(formatProdErrorMessage(321));
	}
	function areHookInputsEqual(nextDeps, prevDeps) {
		if (null === prevDeps) return !1;
		for (var i = 0; i < prevDeps.length && i < nextDeps.length; i++) if (!objectIs(nextDeps[i], prevDeps[i])) return !1;
		return !0;
	}
	function renderWithHooks(current, workInProgress, Component, props, secondArg, nextRenderLanes) {
		renderLanes = nextRenderLanes;
		currentlyRenderingFiber = workInProgress;
		workInProgress.memoizedState = null;
		workInProgress.updateQueue = null;
		workInProgress.lanes = 0;
		ReactSharedInternals.H = null === current || null === current.memoizedState ? HooksDispatcherOnMount : HooksDispatcherOnUpdate;
		shouldDoubleInvokeUserFnsInHooksDEV = !1;
		nextRenderLanes = Component(props, secondArg);
		shouldDoubleInvokeUserFnsInHooksDEV = !1;
		didScheduleRenderPhaseUpdateDuringThisPass && (nextRenderLanes = renderWithHooksAgain(workInProgress, Component, props, secondArg));
		finishRenderingHooks(current);
		return nextRenderLanes;
	}
	function finishRenderingHooks(current) {
		ReactSharedInternals.H = ContextOnlyDispatcher;
		var didRenderTooFewHooks = null !== currentHook && null !== currentHook.next;
		renderLanes = 0;
		workInProgressHook = currentHook = currentlyRenderingFiber = null;
		didScheduleRenderPhaseUpdate = !1;
		thenableIndexCounter = 0;
		thenableState = null;
		if (didRenderTooFewHooks) throw Error(formatProdErrorMessage(300));
		null === current || didReceiveUpdate || (current = current.dependencies, null !== current && checkIfContextChanged(current) && (didReceiveUpdate = !0));
	}
	function renderWithHooksAgain(workInProgress, Component, props, secondArg) {
		currentlyRenderingFiber = workInProgress;
		var numberOfReRenders = 0;
		do {
			didScheduleRenderPhaseUpdateDuringThisPass && (thenableState = null);
			thenableIndexCounter = 0;
			didScheduleRenderPhaseUpdateDuringThisPass = !1;
			if (25 <= numberOfReRenders) throw Error(formatProdErrorMessage(301));
			numberOfReRenders += 1;
			workInProgressHook = currentHook = null;
			if (null != workInProgress.updateQueue) {
				var children = workInProgress.updateQueue;
				children.lastEffect = null;
				children.events = null;
				children.stores = null;
				null != children.memoCache && (children.memoCache.index = 0);
			}
			ReactSharedInternals.H = HooksDispatcherOnRerender;
			children = Component(props, secondArg);
		} while (didScheduleRenderPhaseUpdateDuringThisPass);
		return children;
	}
	function TransitionAwareHostComponent() {
		var dispatcher = ReactSharedInternals.H, maybeThenable = dispatcher.useState()[0];
		maybeThenable = "function" === typeof maybeThenable.then ? useThenable(maybeThenable) : maybeThenable;
		dispatcher = dispatcher.useState()[0];
		(null !== currentHook ? currentHook.memoizedState : null) !== dispatcher && (currentlyRenderingFiber.flags |= 1024);
		return maybeThenable;
	}
	function checkDidRenderIdHook() {
		var didRenderIdHook = 0 !== localIdCounter;
		localIdCounter = 0;
		return didRenderIdHook;
	}
	function bailoutHooks(current, workInProgress, lanes) {
		workInProgress.updateQueue = current.updateQueue;
		workInProgress.flags &= -2053;
		current.lanes &= ~lanes;
	}
	function resetHooksOnUnwind(workInProgress) {
		if (didScheduleRenderPhaseUpdate) {
			for (workInProgress = workInProgress.memoizedState; null !== workInProgress;) {
				var queue = workInProgress.queue;
				null !== queue && (queue.pending = null);
				workInProgress = workInProgress.next;
			}
			didScheduleRenderPhaseUpdate = !1;
		}
		renderLanes = 0;
		workInProgressHook = currentHook = currentlyRenderingFiber = null;
		didScheduleRenderPhaseUpdateDuringThisPass = !1;
		thenableIndexCounter = localIdCounter = 0;
		thenableState = null;
	}
	function mountWorkInProgressHook() {
		var hook = {
			memoizedState: null,
			baseState: null,
			baseQueue: null,
			queue: null,
			next: null
		};
		null === workInProgressHook ? currentlyRenderingFiber.memoizedState = workInProgressHook = hook : workInProgressHook = workInProgressHook.next = hook;
		return workInProgressHook;
	}
	function updateWorkInProgressHook() {
		if (null === currentHook) {
			var nextCurrentHook = currentlyRenderingFiber.alternate;
			nextCurrentHook = null !== nextCurrentHook ? nextCurrentHook.memoizedState : null;
		} else nextCurrentHook = currentHook.next;
		var nextWorkInProgressHook = null === workInProgressHook ? currentlyRenderingFiber.memoizedState : workInProgressHook.next;
		if (null !== nextWorkInProgressHook) workInProgressHook = nextWorkInProgressHook, currentHook = nextCurrentHook;
		else {
			if (null === nextCurrentHook) {
				if (null === currentlyRenderingFiber.alternate) throw Error(formatProdErrorMessage(467));
				throw Error(formatProdErrorMessage(310));
			}
			currentHook = nextCurrentHook;
			nextCurrentHook = {
				memoizedState: currentHook.memoizedState,
				baseState: currentHook.baseState,
				baseQueue: currentHook.baseQueue,
				queue: currentHook.queue,
				next: null
			};
			null === workInProgressHook ? currentlyRenderingFiber.memoizedState = workInProgressHook = nextCurrentHook : workInProgressHook = workInProgressHook.next = nextCurrentHook;
		}
		return workInProgressHook;
	}
	function createFunctionComponentUpdateQueue() {
		return {
			lastEffect: null,
			events: null,
			stores: null,
			memoCache: null
		};
	}
	function useThenable(thenable) {
		var index = thenableIndexCounter;
		thenableIndexCounter += 1;
		null === thenableState && (thenableState = []);
		thenable = trackUsedThenable(thenableState, thenable, index);
		index = currentlyRenderingFiber;
		null === (null === workInProgressHook ? index.memoizedState : workInProgressHook.next) && (index = index.alternate, ReactSharedInternals.H = null === index || null === index.memoizedState ? HooksDispatcherOnMount : HooksDispatcherOnUpdate);
		return thenable;
	}
	function use(usable) {
		if (null !== usable && "object" === typeof usable) {
			if ("function" === typeof usable.then) return useThenable(usable);
			if (usable.$$typeof === REACT_CONTEXT_TYPE) return readContext(usable);
		}
		throw Error(formatProdErrorMessage(438, String(usable)));
	}
	function useMemoCache(size) {
		var memoCache = null, updateQueue = currentlyRenderingFiber.updateQueue;
		null !== updateQueue && (memoCache = updateQueue.memoCache);
		if (null == memoCache) {
			var current = currentlyRenderingFiber.alternate;
			null !== current && (current = current.updateQueue, null !== current && (current = current.memoCache, null != current && (memoCache = {
				data: current.data.map(function(array) {
					return array.slice();
				}),
				index: 0
			})));
		}
		memoCache ??= {
			data: [],
			index: 0
		};
		null === updateQueue && (updateQueue = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = updateQueue);
		updateQueue.memoCache = memoCache;
		updateQueue = memoCache.data[memoCache.index];
		if (void 0 === updateQueue) for (updateQueue = memoCache.data[memoCache.index] = Array(size), current = 0; current < size; current++) updateQueue[current] = REACT_MEMO_CACHE_SENTINEL;
		memoCache.index++;
		return updateQueue;
	}
	function basicStateReducer(state, action) {
		return "function" === typeof action ? action(state) : action;
	}
	function updateReducer(reducer) {
		return updateReducerImpl(updateWorkInProgressHook(), currentHook, reducer);
	}
	function updateReducerImpl(hook, current, reducer) {
		var queue = hook.queue;
		if (null === queue) throw Error(formatProdErrorMessage(311));
		queue.lastRenderedReducer = reducer;
		var baseQueue = hook.baseQueue, pendingQueue = queue.pending;
		if (null !== pendingQueue) {
			if (null !== baseQueue) {
				var baseFirst = baseQueue.next;
				baseQueue.next = pendingQueue.next;
				pendingQueue.next = baseFirst;
			}
			current.baseQueue = baseQueue = pendingQueue;
			queue.pending = null;
		}
		pendingQueue = hook.baseState;
		if (null === baseQueue) hook.memoizedState = pendingQueue;
		else {
			current = baseQueue.next;
			var newBaseQueueFirst = baseFirst = null, newBaseQueueLast = null, update = current, didReadFromEntangledAsyncAction$60 = !1;
			do {
				var updateLane = update.lane & -536870913;
				if (updateLane !== update.lane ? (workInProgressRootRenderLanes & updateLane) === updateLane : (renderLanes & updateLane) === updateLane) {
					var revertLane = update.revertLane;
					if (0 === revertLane) null !== newBaseQueueLast && (newBaseQueueLast = newBaseQueueLast.next = {
						lane: 0,
						revertLane: 0,
						gesture: null,
						action: update.action,
						hasEagerState: update.hasEagerState,
						eagerState: update.eagerState,
						next: null
					}), updateLane === currentEntangledLane && (didReadFromEntangledAsyncAction$60 = !0);
					else if ((renderLanes & revertLane) === revertLane) {
						update = update.next;
						revertLane === currentEntangledLane && (didReadFromEntangledAsyncAction$60 = !0);
						continue;
					} else updateLane = {
						lane: 0,
						revertLane: update.revertLane,
						gesture: null,
						action: update.action,
						hasEagerState: update.hasEagerState,
						eagerState: update.eagerState,
						next: null
					}, null === newBaseQueueLast ? (newBaseQueueFirst = newBaseQueueLast = updateLane, baseFirst = pendingQueue) : newBaseQueueLast = newBaseQueueLast.next = updateLane, currentlyRenderingFiber.lanes |= revertLane, workInProgressRootSkippedLanes |= revertLane;
					updateLane = update.action;
					shouldDoubleInvokeUserFnsInHooksDEV && reducer(pendingQueue, updateLane);
					pendingQueue = update.hasEagerState ? update.eagerState : reducer(pendingQueue, updateLane);
				} else revertLane = {
					lane: updateLane,
					revertLane: update.revertLane,
					gesture: update.gesture,
					action: update.action,
					hasEagerState: update.hasEagerState,
					eagerState: update.eagerState,
					next: null
				}, null === newBaseQueueLast ? (newBaseQueueFirst = newBaseQueueLast = revertLane, baseFirst = pendingQueue) : newBaseQueueLast = newBaseQueueLast.next = revertLane, currentlyRenderingFiber.lanes |= updateLane, workInProgressRootSkippedLanes |= updateLane;
				update = update.next;
			} while (null !== update && update !== current);
			null === newBaseQueueLast ? baseFirst = pendingQueue : newBaseQueueLast.next = newBaseQueueFirst;
			if (!objectIs(pendingQueue, hook.memoizedState) && (didReceiveUpdate = !0, didReadFromEntangledAsyncAction$60 && (reducer = currentEntangledActionThenable, null !== reducer))) throw reducer;
			hook.memoizedState = pendingQueue;
			hook.baseState = baseFirst;
			hook.baseQueue = newBaseQueueLast;
			queue.lastRenderedState = pendingQueue;
		}
		null === baseQueue && (queue.lanes = 0);
		return [hook.memoizedState, queue.dispatch];
	}
	function rerenderReducer(reducer) {
		var hook = updateWorkInProgressHook(), queue = hook.queue;
		if (null === queue) throw Error(formatProdErrorMessage(311));
		queue.lastRenderedReducer = reducer;
		var dispatch = queue.dispatch, lastRenderPhaseUpdate = queue.pending, newState = hook.memoizedState;
		if (null !== lastRenderPhaseUpdate) {
			queue.pending = null;
			var update = lastRenderPhaseUpdate = lastRenderPhaseUpdate.next;
			do
				newState = reducer(newState, update.action), update = update.next;
			while (update !== lastRenderPhaseUpdate);
			objectIs(newState, hook.memoizedState) || (didReceiveUpdate = !0);
			hook.memoizedState = newState;
			null === hook.baseQueue && (hook.baseState = newState);
			queue.lastRenderedState = newState;
		}
		return [newState, dispatch];
	}
	function updateSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
		var fiber = currentlyRenderingFiber, hook = updateWorkInProgressHook(), isHydrating$jscomp$0 = isHydrating;
		if (isHydrating$jscomp$0) {
			if (void 0 === getServerSnapshot) throw Error(formatProdErrorMessage(407));
			getServerSnapshot = getServerSnapshot();
		} else getServerSnapshot = getSnapshot();
		var snapshotChanged = !objectIs((currentHook || hook).memoizedState, getServerSnapshot);
		snapshotChanged && (hook.memoizedState = getServerSnapshot, didReceiveUpdate = !0);
		hook = hook.queue;
		updateEffect(subscribeToStore.bind(null, fiber, hook, subscribe), [subscribe]);
		if (hook.getSnapshot !== getSnapshot || snapshotChanged || null !== workInProgressHook && workInProgressHook.memoizedState.tag & 1) {
			fiber.flags |= 2048;
			pushSimpleEffect(9, { destroy: void 0 }, updateStoreInstance.bind(null, fiber, hook, getServerSnapshot, getSnapshot), null);
			if (null === workInProgressRoot) throw Error(formatProdErrorMessage(349));
			isHydrating$jscomp$0 || 0 !== (renderLanes & 127) || pushStoreConsistencyCheck(fiber, getSnapshot, getServerSnapshot);
		}
		return getServerSnapshot;
	}
	function pushStoreConsistencyCheck(fiber, getSnapshot, renderedSnapshot) {
		fiber.flags |= 16384;
		fiber = {
			getSnapshot,
			value: renderedSnapshot
		};
		getSnapshot = currentlyRenderingFiber.updateQueue;
		null === getSnapshot ? (getSnapshot = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = getSnapshot, getSnapshot.stores = [fiber]) : (renderedSnapshot = getSnapshot.stores, null === renderedSnapshot ? getSnapshot.stores = [fiber] : renderedSnapshot.push(fiber));
	}
	function updateStoreInstance(fiber, inst, nextSnapshot, getSnapshot) {
		inst.value = nextSnapshot;
		inst.getSnapshot = getSnapshot;
		checkIfSnapshotChanged(inst) && forceStoreRerender(fiber);
	}
	function subscribeToStore(fiber, inst, subscribe) {
		return subscribe(function() {
			checkIfSnapshotChanged(inst) && forceStoreRerender(fiber);
		});
	}
	function checkIfSnapshotChanged(inst) {
		var latestGetSnapshot = inst.getSnapshot;
		inst = inst.value;
		try {
			var nextValue = latestGetSnapshot();
			return !objectIs(inst, nextValue);
		} catch (error) {
			return !0;
		}
	}
	function forceStoreRerender(fiber) {
		var root = enqueueConcurrentRenderForLane(fiber, 2);
		null !== root && scheduleUpdateOnFiber(root, fiber, 2);
	}
	function mountStateImpl(initialState) {
		var hook = mountWorkInProgressHook();
		if ("function" === typeof initialState) {
			var initialStateInitializer = initialState;
			initialState = initialStateInitializer();
			if (shouldDoubleInvokeUserFnsInHooksDEV) {
				setIsStrictModeForDevtools(!0);
				try {
					initialStateInitializer();
				} finally {
					setIsStrictModeForDevtools(!1);
				}
			}
		}
		hook.memoizedState = hook.baseState = initialState;
		hook.queue = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: basicStateReducer,
			lastRenderedState: initialState
		};
		return hook;
	}
	function updateOptimisticImpl(hook, current, passthrough, reducer) {
		hook.baseState = passthrough;
		return updateReducerImpl(hook, currentHook, "function" === typeof reducer ? reducer : basicStateReducer);
	}
	function dispatchActionState(fiber, actionQueue, setPendingState, setState, payload) {
		if (isRenderPhaseUpdate(fiber)) throw Error(formatProdErrorMessage(485));
		fiber = actionQueue.action;
		if (null !== fiber) {
			var actionNode = {
				payload,
				action: fiber,
				next: null,
				isTransition: !0,
				status: "pending",
				value: null,
				reason: null,
				listeners: [],
				then: function(listener) {
					actionNode.listeners.push(listener);
				}
			};
			null !== ReactSharedInternals.T ? setPendingState(!0) : actionNode.isTransition = !1;
			setState(actionNode);
			setPendingState = actionQueue.pending;
			null === setPendingState ? (actionNode.next = actionQueue.pending = actionNode, runActionStateAction(actionQueue, actionNode)) : (actionNode.next = setPendingState.next, actionQueue.pending = setPendingState.next = actionNode);
		}
	}
	function runActionStateAction(actionQueue, node) {
		var action = node.action, payload = node.payload, prevState = actionQueue.state;
		if (node.isTransition) {
			var prevTransition = ReactSharedInternals.T, currentTransition = {};
			ReactSharedInternals.T = currentTransition;
			try {
				var returnValue = action(prevState, payload), onStartTransitionFinish = ReactSharedInternals.S;
				null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
				handleActionReturnValue(actionQueue, node, returnValue);
			} catch (error) {
				onActionError(actionQueue, node, error);
			} finally {
				null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
			}
		} else try {
			prevTransition = action(prevState, payload), handleActionReturnValue(actionQueue, node, prevTransition);
		} catch (error$66) {
			onActionError(actionQueue, node, error$66);
		}
	}
	function handleActionReturnValue(actionQueue, node, returnValue) {
		null !== returnValue && "object" === typeof returnValue && "function" === typeof returnValue.then ? returnValue.then(function(nextState) {
			onActionSuccess(actionQueue, node, nextState);
		}, function(error) {
			return onActionError(actionQueue, node, error);
		}) : onActionSuccess(actionQueue, node, returnValue);
	}
	function onActionSuccess(actionQueue, actionNode, nextState) {
		actionNode.status = "fulfilled";
		actionNode.value = nextState;
		notifyActionListeners(actionNode);
		actionQueue.state = nextState;
		actionNode = actionQueue.pending;
		null !== actionNode && (nextState = actionNode.next, nextState === actionNode ? actionQueue.pending = null : (nextState = nextState.next, actionNode.next = nextState, runActionStateAction(actionQueue, nextState)));
	}
	function onActionError(actionQueue, actionNode, error) {
		var last = actionQueue.pending;
		actionQueue.pending = null;
		if (null !== last) {
			last = last.next;
			do
				actionNode.status = "rejected", actionNode.reason = error, notifyActionListeners(actionNode), actionNode = actionNode.next;
			while (actionNode !== last);
		}
		actionQueue.action = null;
	}
	function notifyActionListeners(actionNode) {
		actionNode = actionNode.listeners;
		for (var i = 0; i < actionNode.length; i++) (0, actionNode[i])();
	}
	function actionStateReducer(oldState, newState) {
		return newState;
	}
	function mountActionState(action, initialStateProp) {
		if (isHydrating) {
			var ssrFormState = workInProgressRoot.formState;
			if (null !== ssrFormState) {
				a: {
					var JSCompiler_inline_result = currentlyRenderingFiber;
					if (isHydrating) {
						if (nextHydratableInstance) {
							b: {
								var JSCompiler_inline_result$jscomp$0 = nextHydratableInstance;
								for (var inRootOrSingleton = rootOrSingletonContext; 8 !== JSCompiler_inline_result$jscomp$0.nodeType;) {
									if (!inRootOrSingleton) {
										JSCompiler_inline_result$jscomp$0 = null;
										break b;
									}
									JSCompiler_inline_result$jscomp$0 = getNextHydratable(JSCompiler_inline_result$jscomp$0.nextSibling);
									if (null === JSCompiler_inline_result$jscomp$0) {
										JSCompiler_inline_result$jscomp$0 = null;
										break b;
									}
								}
								inRootOrSingleton = JSCompiler_inline_result$jscomp$0.data;
								JSCompiler_inline_result$jscomp$0 = "F!" === inRootOrSingleton || "F" === inRootOrSingleton ? JSCompiler_inline_result$jscomp$0 : null;
							}
							if (JSCompiler_inline_result$jscomp$0) {
								nextHydratableInstance = getNextHydratable(JSCompiler_inline_result$jscomp$0.nextSibling);
								JSCompiler_inline_result = "F!" === JSCompiler_inline_result$jscomp$0.data;
								break a;
							}
						}
						throwOnHydrationMismatch(JSCompiler_inline_result);
					}
					JSCompiler_inline_result = !1;
				}
				JSCompiler_inline_result && (initialStateProp = ssrFormState[0]);
			}
		}
		ssrFormState = mountWorkInProgressHook();
		ssrFormState.memoizedState = ssrFormState.baseState = initialStateProp;
		JSCompiler_inline_result = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: actionStateReducer,
			lastRenderedState: initialStateProp
		};
		ssrFormState.queue = JSCompiler_inline_result;
		ssrFormState = dispatchSetState.bind(null, currentlyRenderingFiber, JSCompiler_inline_result);
		JSCompiler_inline_result.dispatch = ssrFormState;
		JSCompiler_inline_result = mountStateImpl(!1);
		inRootOrSingleton = dispatchOptimisticSetState.bind(null, currentlyRenderingFiber, !1, JSCompiler_inline_result.queue);
		JSCompiler_inline_result = mountWorkInProgressHook();
		JSCompiler_inline_result$jscomp$0 = {
			state: initialStateProp,
			dispatch: null,
			action,
			pending: null
		};
		JSCompiler_inline_result.queue = JSCompiler_inline_result$jscomp$0;
		ssrFormState = dispatchActionState.bind(null, currentlyRenderingFiber, JSCompiler_inline_result$jscomp$0, inRootOrSingleton, ssrFormState);
		JSCompiler_inline_result$jscomp$0.dispatch = ssrFormState;
		JSCompiler_inline_result.memoizedState = action;
		return [
			initialStateProp,
			ssrFormState,
			!1
		];
	}
	function updateActionState(action) {
		return updateActionStateImpl(updateWorkInProgressHook(), currentHook, action);
	}
	function updateActionStateImpl(stateHook, currentStateHook, action) {
		currentStateHook = updateReducerImpl(stateHook, currentStateHook, actionStateReducer)[0];
		stateHook = updateReducer(basicStateReducer)[0];
		if ("object" === typeof currentStateHook && null !== currentStateHook && "function" === typeof currentStateHook.then) try {
			var state = useThenable(currentStateHook);
		} catch (x) {
			if (x === SuspenseException) throw SuspenseActionException;
			throw x;
		}
		else state = currentStateHook;
		currentStateHook = updateWorkInProgressHook();
		var actionQueue = currentStateHook.queue, dispatch = actionQueue.dispatch;
		action !== currentStateHook.memoizedState && (currentlyRenderingFiber.flags |= 2048, pushSimpleEffect(9, { destroy: void 0 }, actionStateActionEffect.bind(null, actionQueue, action), null));
		return [
			state,
			dispatch,
			stateHook
		];
	}
	function actionStateActionEffect(actionQueue, action) {
		actionQueue.action = action;
	}
	function rerenderActionState(action) {
		var stateHook = updateWorkInProgressHook(), currentStateHook = currentHook;
		if (null !== currentStateHook) return updateActionStateImpl(stateHook, currentStateHook, action);
		updateWorkInProgressHook();
		stateHook = stateHook.memoizedState;
		currentStateHook = updateWorkInProgressHook();
		var dispatch = currentStateHook.queue.dispatch;
		currentStateHook.memoizedState = action;
		return [
			stateHook,
			dispatch,
			!1
		];
	}
	function pushSimpleEffect(tag, inst, create, deps) {
		tag = {
			tag,
			create,
			deps,
			inst,
			next: null
		};
		inst = currentlyRenderingFiber.updateQueue;
		null === inst && (inst = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = inst);
		create = inst.lastEffect;
		null === create ? inst.lastEffect = tag.next = tag : (deps = create.next, create.next = tag, tag.next = deps, inst.lastEffect = tag);
		return tag;
	}
	function updateRef() {
		return updateWorkInProgressHook().memoizedState;
	}
	function mountEffectImpl(fiberFlags, hookFlags, create, deps) {
		var hook = mountWorkInProgressHook();
		currentlyRenderingFiber.flags |= fiberFlags;
		hook.memoizedState = pushSimpleEffect(1 | hookFlags, { destroy: void 0 }, create, void 0 === deps ? null : deps);
	}
	function updateEffectImpl(fiberFlags, hookFlags, create, deps) {
		var hook = updateWorkInProgressHook();
		deps = void 0 === deps ? null : deps;
		var inst = hook.memoizedState.inst;
		null !== currentHook && null !== deps && areHookInputsEqual(deps, currentHook.memoizedState.deps) ? hook.memoizedState = pushSimpleEffect(hookFlags, inst, create, deps) : (currentlyRenderingFiber.flags |= fiberFlags, hook.memoizedState = pushSimpleEffect(1 | hookFlags, inst, create, deps));
	}
	function mountEffect(create, deps) {
		mountEffectImpl(8390656, 8, create, deps);
	}
	function updateEffect(create, deps) {
		updateEffectImpl(2048, 8, create, deps);
	}
	function useEffectEventImpl(payload) {
		currentlyRenderingFiber.flags |= 4;
		var componentUpdateQueue = currentlyRenderingFiber.updateQueue;
		if (null === componentUpdateQueue) componentUpdateQueue = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = componentUpdateQueue, componentUpdateQueue.events = [payload];
		else {
			var events = componentUpdateQueue.events;
			null === events ? componentUpdateQueue.events = [payload] : events.push(payload);
		}
	}
	function updateEvent(callback) {
		var ref = updateWorkInProgressHook().memoizedState;
		useEffectEventImpl({
			ref,
			nextImpl: callback
		});
		return function() {
			if (0 !== (executionContext & 2)) throw Error(formatProdErrorMessage(440));
			return ref.impl.apply(void 0, arguments);
		};
	}
	function updateInsertionEffect(create, deps) {
		return updateEffectImpl(4, 2, create, deps);
	}
	function updateLayoutEffect(create, deps) {
		return updateEffectImpl(4, 4, create, deps);
	}
	function imperativeHandleEffect(create, ref) {
		if ("function" === typeof ref) {
			create = create();
			var refCleanup = ref(create);
			return function() {
				"function" === typeof refCleanup ? refCleanup() : ref(null);
			};
		}
		if (null !== ref && void 0 !== ref) return create = create(), ref.current = create, function() {
			ref.current = null;
		};
	}
	function updateImperativeHandle(ref, create, deps) {
		deps = null !== deps && void 0 !== deps ? deps.concat([ref]) : null;
		updateEffectImpl(4, 4, imperativeHandleEffect.bind(null, create, ref), deps);
	}
	function mountDebugValue() {}
	function updateCallback(callback, deps) {
		var hook = updateWorkInProgressHook();
		deps = void 0 === deps ? null : deps;
		var prevState = hook.memoizedState;
		if (null !== deps && areHookInputsEqual(deps, prevState[1])) return prevState[0];
		hook.memoizedState = [callback, deps];
		return callback;
	}
	function updateMemo(nextCreate, deps) {
		var hook = updateWorkInProgressHook();
		deps = void 0 === deps ? null : deps;
		var prevState = hook.memoizedState;
		if (null !== deps && areHookInputsEqual(deps, prevState[1])) return prevState[0];
		prevState = nextCreate();
		if (shouldDoubleInvokeUserFnsInHooksDEV) {
			setIsStrictModeForDevtools(!0);
			try {
				nextCreate();
			} finally {
				setIsStrictModeForDevtools(!1);
			}
		}
		hook.memoizedState = [prevState, deps];
		return prevState;
	}
	function mountDeferredValueImpl(hook, value, initialValue) {
		if (void 0 === initialValue || 0 !== (renderLanes & 1073741824) && 0 === (workInProgressRootRenderLanes & 261930)) return hook.memoizedState = value;
		hook.memoizedState = initialValue;
		hook = requestDeferredLane();
		currentlyRenderingFiber.lanes |= hook;
		workInProgressRootSkippedLanes |= hook;
		return initialValue;
	}
	function updateDeferredValueImpl(hook, prevValue, value, initialValue) {
		if (objectIs(value, prevValue)) return value;
		if (null !== currentTreeHiddenStackCursor.current) return hook = mountDeferredValueImpl(hook, value, initialValue), objectIs(hook, prevValue) || (didReceiveUpdate = !0), hook;
		if (0 === (renderLanes & 42) || 0 !== (renderLanes & 1073741824) && 0 === (workInProgressRootRenderLanes & 261930)) return didReceiveUpdate = !0, hook.memoizedState = value;
		hook = requestDeferredLane();
		currentlyRenderingFiber.lanes |= hook;
		workInProgressRootSkippedLanes |= hook;
		return prevValue;
	}
	function startTransition(fiber, queue, pendingState, finishedState, callback) {
		var previousPriority = ReactDOMSharedInternals.p;
		ReactDOMSharedInternals.p = 0 !== previousPriority && 8 > previousPriority ? previousPriority : 8;
		var prevTransition = ReactSharedInternals.T, currentTransition = {};
		ReactSharedInternals.T = currentTransition;
		dispatchOptimisticSetState(fiber, !1, queue, pendingState);
		try {
			var returnValue = callback(), onStartTransitionFinish = ReactSharedInternals.S;
			null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
			if (null !== returnValue && "object" === typeof returnValue && "function" === typeof returnValue.then) dispatchSetStateInternal(fiber, queue, chainThenableValue(returnValue, finishedState), requestUpdateLane(fiber));
			else dispatchSetStateInternal(fiber, queue, finishedState, requestUpdateLane(fiber));
		} catch (error) {
			dispatchSetStateInternal(fiber, queue, {
				then: function() {},
				status: "rejected",
				reason: error
			}, requestUpdateLane());
		} finally {
			ReactDOMSharedInternals.p = previousPriority, null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
		}
	}
	function noop() {}
	function startHostTransition(formFiber, pendingState, action, formData) {
		if (5 !== formFiber.tag) throw Error(formatProdErrorMessage(476));
		var queue = ensureFormComponentIsStateful(formFiber).queue;
		startTransition(formFiber, queue, pendingState, sharedNotPendingObject, null === action ? noop : function() {
			requestFormReset$1(formFiber);
			return action(formData);
		});
	}
	function ensureFormComponentIsStateful(formFiber) {
		var existingStateHook = formFiber.memoizedState;
		if (null !== existingStateHook) return existingStateHook;
		existingStateHook = {
			memoizedState: sharedNotPendingObject,
			baseState: sharedNotPendingObject,
			baseQueue: null,
			queue: {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: basicStateReducer,
				lastRenderedState: sharedNotPendingObject
			},
			next: null
		};
		var initialResetState = {};
		existingStateHook.next = {
			memoizedState: initialResetState,
			baseState: initialResetState,
			baseQueue: null,
			queue: {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: basicStateReducer,
				lastRenderedState: initialResetState
			},
			next: null
		};
		formFiber.memoizedState = existingStateHook;
		formFiber = formFiber.alternate;
		null !== formFiber && (formFiber.memoizedState = existingStateHook);
		return existingStateHook;
	}
	function requestFormReset$1(formFiber) {
		var stateHook = ensureFormComponentIsStateful(formFiber);
		null === stateHook.next && (stateHook = formFiber.alternate.memoizedState);
		dispatchSetStateInternal(formFiber, stateHook.next.queue, {}, requestUpdateLane());
	}
	function useHostTransitionStatus() {
		return readContext(HostTransitionContext);
	}
	function updateId() {
		return updateWorkInProgressHook().memoizedState;
	}
	function updateRefresh() {
		return updateWorkInProgressHook().memoizedState;
	}
	function refreshCache(fiber) {
		for (var provider = fiber.return; null !== provider;) {
			switch (provider.tag) {
				case 24:
				case 3:
					var lane = requestUpdateLane();
					fiber = createUpdate(lane);
					var root$69 = enqueueUpdate(provider, fiber, lane);
					null !== root$69 && (scheduleUpdateOnFiber(root$69, provider, lane), entangleTransitions(root$69, provider, lane));
					provider = { cache: createCache() };
					fiber.payload = provider;
					return;
			}
			provider = provider.return;
		}
	}
	function dispatchReducerAction(fiber, queue, action) {
		var lane = requestUpdateLane();
		action = {
			lane,
			revertLane: 0,
			gesture: null,
			action,
			hasEagerState: !1,
			eagerState: null,
			next: null
		};
		isRenderPhaseUpdate(fiber) ? enqueueRenderPhaseUpdate(queue, action) : (action = enqueueConcurrentHookUpdate(fiber, queue, action, lane), null !== action && (scheduleUpdateOnFiber(action, fiber, lane), entangleTransitionUpdate(action, queue, lane)));
	}
	function dispatchSetState(fiber, queue, action) {
		dispatchSetStateInternal(fiber, queue, action, requestUpdateLane());
	}
	function dispatchSetStateInternal(fiber, queue, action, lane) {
		var update = {
			lane,
			revertLane: 0,
			gesture: null,
			action,
			hasEagerState: !1,
			eagerState: null,
			next: null
		};
		if (isRenderPhaseUpdate(fiber)) enqueueRenderPhaseUpdate(queue, update);
		else {
			var alternate = fiber.alternate;
			if (0 === fiber.lanes && (null === alternate || 0 === alternate.lanes) && (alternate = queue.lastRenderedReducer, null !== alternate)) try {
				var currentState = queue.lastRenderedState, eagerState = alternate(currentState, action);
				update.hasEagerState = !0;
				update.eagerState = eagerState;
				if (objectIs(eagerState, currentState)) return enqueueUpdate$1(fiber, queue, update, 0), null === workInProgressRoot && finishQueueingConcurrentUpdates(), !1;
			} catch (error) {}
			action = enqueueConcurrentHookUpdate(fiber, queue, update, lane);
			if (null !== action) return scheduleUpdateOnFiber(action, fiber, lane), entangleTransitionUpdate(action, queue, lane), !0;
		}
		return !1;
	}
	function dispatchOptimisticSetState(fiber, throwIfDuringRender, queue, action) {
		action = {
			lane: 2,
			revertLane: requestTransitionLane(),
			gesture: null,
			action,
			hasEagerState: !1,
			eagerState: null,
			next: null
		};
		if (isRenderPhaseUpdate(fiber)) {
			if (throwIfDuringRender) throw Error(formatProdErrorMessage(479));
		} else throwIfDuringRender = enqueueConcurrentHookUpdate(fiber, queue, action, 2), null !== throwIfDuringRender && scheduleUpdateOnFiber(throwIfDuringRender, fiber, 2);
	}
	function isRenderPhaseUpdate(fiber) {
		var alternate = fiber.alternate;
		return fiber === currentlyRenderingFiber || null !== alternate && alternate === currentlyRenderingFiber;
	}
	function enqueueRenderPhaseUpdate(queue, update) {
		didScheduleRenderPhaseUpdateDuringThisPass = didScheduleRenderPhaseUpdate = !0;
		var pending = queue.pending;
		null === pending ? update.next = update : (update.next = pending.next, pending.next = update);
		queue.pending = update;
	}
	function entangleTransitionUpdate(root, queue, lane) {
		if (0 !== (lane & 4194048)) {
			var queueLanes = queue.lanes;
			queueLanes &= root.pendingLanes;
			lane |= queueLanes;
			queue.lanes = lane;
			markRootEntangled(root, lane);
		}
	}
	var ContextOnlyDispatcher = {
		readContext,
		use,
		useCallback: throwInvalidHookError,
		useContext: throwInvalidHookError,
		useEffect: throwInvalidHookError,
		useImperativeHandle: throwInvalidHookError,
		useLayoutEffect: throwInvalidHookError,
		useInsertionEffect: throwInvalidHookError,
		useMemo: throwInvalidHookError,
		useReducer: throwInvalidHookError,
		useRef: throwInvalidHookError,
		useState: throwInvalidHookError,
		useDebugValue: throwInvalidHookError,
		useDeferredValue: throwInvalidHookError,
		useTransition: throwInvalidHookError,
		useSyncExternalStore: throwInvalidHookError,
		useId: throwInvalidHookError,
		useHostTransitionStatus: throwInvalidHookError,
		useFormState: throwInvalidHookError,
		useActionState: throwInvalidHookError,
		useOptimistic: throwInvalidHookError,
		useMemoCache: throwInvalidHookError,
		useCacheRefresh: throwInvalidHookError
	};
	ContextOnlyDispatcher.useEffectEvent = throwInvalidHookError;
	var HooksDispatcherOnMount = {
		readContext,
		use,
		useCallback: function(callback, deps) {
			mountWorkInProgressHook().memoizedState = [callback, void 0 === deps ? null : deps];
			return callback;
		},
		useContext: readContext,
		useEffect: mountEffect,
		useImperativeHandle: function(ref, create, deps) {
			deps = null !== deps && void 0 !== deps ? deps.concat([ref]) : null;
			mountEffectImpl(4194308, 4, imperativeHandleEffect.bind(null, create, ref), deps);
		},
		useLayoutEffect: function(create, deps) {
			return mountEffectImpl(4194308, 4, create, deps);
		},
		useInsertionEffect: function(create, deps) {
			mountEffectImpl(4, 2, create, deps);
		},
		useMemo: function(nextCreate, deps) {
			var hook = mountWorkInProgressHook();
			deps = void 0 === deps ? null : deps;
			var nextValue = nextCreate();
			if (shouldDoubleInvokeUserFnsInHooksDEV) {
				setIsStrictModeForDevtools(!0);
				try {
					nextCreate();
				} finally {
					setIsStrictModeForDevtools(!1);
				}
			}
			hook.memoizedState = [nextValue, deps];
			return nextValue;
		},
		useReducer: function(reducer, initialArg, init) {
			var hook = mountWorkInProgressHook();
			if (void 0 !== init) {
				var initialState = init(initialArg);
				if (shouldDoubleInvokeUserFnsInHooksDEV) {
					setIsStrictModeForDevtools(!0);
					try {
						init(initialArg);
					} finally {
						setIsStrictModeForDevtools(!1);
					}
				}
			} else initialState = initialArg;
			hook.memoizedState = hook.baseState = initialState;
			reducer = {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: reducer,
				lastRenderedState: initialState
			};
			hook.queue = reducer;
			reducer = reducer.dispatch = dispatchReducerAction.bind(null, currentlyRenderingFiber, reducer);
			return [hook.memoizedState, reducer];
		},
		useRef: function(initialValue) {
			var hook = mountWorkInProgressHook();
			initialValue = { current: initialValue };
			return hook.memoizedState = initialValue;
		},
		useState: function(initialState) {
			initialState = mountStateImpl(initialState);
			var queue = initialState.queue, dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue);
			queue.dispatch = dispatch;
			return [initialState.memoizedState, dispatch];
		},
		useDebugValue: mountDebugValue,
		useDeferredValue: function(value, initialValue) {
			return mountDeferredValueImpl(mountWorkInProgressHook(), value, initialValue);
		},
		useTransition: function() {
			var stateHook = mountStateImpl(!1);
			stateHook = startTransition.bind(null, currentlyRenderingFiber, stateHook.queue, !0, !1);
			mountWorkInProgressHook().memoizedState = stateHook;
			return [!1, stateHook];
		},
		useSyncExternalStore: function(subscribe, getSnapshot, getServerSnapshot) {
			var fiber = currentlyRenderingFiber, hook = mountWorkInProgressHook();
			if (isHydrating) {
				if (void 0 === getServerSnapshot) throw Error(formatProdErrorMessage(407));
				getServerSnapshot = getServerSnapshot();
			} else {
				getServerSnapshot = getSnapshot();
				if (null === workInProgressRoot) throw Error(formatProdErrorMessage(349));
				0 !== (workInProgressRootRenderLanes & 127) || pushStoreConsistencyCheck(fiber, getSnapshot, getServerSnapshot);
			}
			hook.memoizedState = getServerSnapshot;
			var inst = {
				value: getServerSnapshot,
				getSnapshot
			};
			hook.queue = inst;
			mountEffect(subscribeToStore.bind(null, fiber, inst, subscribe), [subscribe]);
			fiber.flags |= 2048;
			pushSimpleEffect(9, { destroy: void 0 }, updateStoreInstance.bind(null, fiber, inst, getServerSnapshot, getSnapshot), null);
			return getServerSnapshot;
		},
		useId: function() {
			var hook = mountWorkInProgressHook(), identifierPrefix = workInProgressRoot.identifierPrefix;
			if (isHydrating) {
				var JSCompiler_inline_result = treeContextOverflow;
				var idWithLeadingBit = treeContextId;
				JSCompiler_inline_result = (idWithLeadingBit & ~(1 << 32 - clz32(idWithLeadingBit) - 1)).toString(32) + JSCompiler_inline_result;
				identifierPrefix = "_" + identifierPrefix + "R_" + JSCompiler_inline_result;
				JSCompiler_inline_result = localIdCounter++;
				0 < JSCompiler_inline_result && (identifierPrefix += "H" + JSCompiler_inline_result.toString(32));
				identifierPrefix += "_";
			} else JSCompiler_inline_result = globalClientIdCounter++, identifierPrefix = "_" + identifierPrefix + "r_" + JSCompiler_inline_result.toString(32) + "_";
			return hook.memoizedState = identifierPrefix;
		},
		useHostTransitionStatus,
		useFormState: mountActionState,
		useActionState: mountActionState,
		useOptimistic: function(passthrough) {
			var hook = mountWorkInProgressHook();
			hook.memoizedState = hook.baseState = passthrough;
			var queue = {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: null,
				lastRenderedState: null
			};
			hook.queue = queue;
			hook = dispatchOptimisticSetState.bind(null, currentlyRenderingFiber, !0, queue);
			queue.dispatch = hook;
			return [passthrough, hook];
		},
		useMemoCache,
		useCacheRefresh: function() {
			return mountWorkInProgressHook().memoizedState = refreshCache.bind(null, currentlyRenderingFiber);
		},
		useEffectEvent: function(callback) {
			var hook = mountWorkInProgressHook(), ref = { impl: callback };
			hook.memoizedState = ref;
			return function() {
				if (0 !== (executionContext & 2)) throw Error(formatProdErrorMessage(440));
				return ref.impl.apply(void 0, arguments);
			};
		}
	}, HooksDispatcherOnUpdate = {
		readContext,
		use,
		useCallback: updateCallback,
		useContext: readContext,
		useEffect: updateEffect,
		useImperativeHandle: updateImperativeHandle,
		useInsertionEffect: updateInsertionEffect,
		useLayoutEffect: updateLayoutEffect,
		useMemo: updateMemo,
		useReducer: updateReducer,
		useRef: updateRef,
		useState: function() {
			return updateReducer(basicStateReducer);
		},
		useDebugValue: mountDebugValue,
		useDeferredValue: function(value, initialValue) {
			return updateDeferredValueImpl(updateWorkInProgressHook(), currentHook.memoizedState, value, initialValue);
		},
		useTransition: function() {
			var booleanOrThenable = updateReducer(basicStateReducer)[0], start = updateWorkInProgressHook().memoizedState;
			return ["boolean" === typeof booleanOrThenable ? booleanOrThenable : useThenable(booleanOrThenable), start];
		},
		useSyncExternalStore: updateSyncExternalStore,
		useId: updateId,
		useHostTransitionStatus,
		useFormState: updateActionState,
		useActionState: updateActionState,
		useOptimistic: function(passthrough, reducer) {
			return updateOptimisticImpl(updateWorkInProgressHook(), currentHook, passthrough, reducer);
		},
		useMemoCache,
		useCacheRefresh: updateRefresh
	};
	HooksDispatcherOnUpdate.useEffectEvent = updateEvent;
	var HooksDispatcherOnRerender = {
		readContext,
		use,
		useCallback: updateCallback,
		useContext: readContext,
		useEffect: updateEffect,
		useImperativeHandle: updateImperativeHandle,
		useInsertionEffect: updateInsertionEffect,
		useLayoutEffect: updateLayoutEffect,
		useMemo: updateMemo,
		useReducer: rerenderReducer,
		useRef: updateRef,
		useState: function() {
			return rerenderReducer(basicStateReducer);
		},
		useDebugValue: mountDebugValue,
		useDeferredValue: function(value, initialValue) {
			var hook = updateWorkInProgressHook();
			return null === currentHook ? mountDeferredValueImpl(hook, value, initialValue) : updateDeferredValueImpl(hook, currentHook.memoizedState, value, initialValue);
		},
		useTransition: function() {
			var booleanOrThenable = rerenderReducer(basicStateReducer)[0], start = updateWorkInProgressHook().memoizedState;
			return ["boolean" === typeof booleanOrThenable ? booleanOrThenable : useThenable(booleanOrThenable), start];
		},
		useSyncExternalStore: updateSyncExternalStore,
		useId: updateId,
		useHostTransitionStatus,
		useFormState: rerenderActionState,
		useActionState: rerenderActionState,
		useOptimistic: function(passthrough, reducer) {
			var hook = updateWorkInProgressHook();
			if (null !== currentHook) return updateOptimisticImpl(hook, currentHook, passthrough, reducer);
			hook.baseState = passthrough;
			return [passthrough, hook.queue.dispatch];
		},
		useMemoCache,
		useCacheRefresh: updateRefresh
	};
	HooksDispatcherOnRerender.useEffectEvent = updateEvent;
	function applyDerivedStateFromProps(workInProgress, ctor, getDerivedStateFromProps, nextProps) {
		ctor = workInProgress.memoizedState;
		getDerivedStateFromProps = getDerivedStateFromProps(nextProps, ctor);
		getDerivedStateFromProps = null === getDerivedStateFromProps || void 0 === getDerivedStateFromProps ? ctor : assign({}, ctor, getDerivedStateFromProps);
		workInProgress.memoizedState = getDerivedStateFromProps;
		0 === workInProgress.lanes && (workInProgress.updateQueue.baseState = getDerivedStateFromProps);
	}
	var classComponentUpdater = {
		enqueueSetState: function(inst, payload, callback) {
			inst = inst._reactInternals;
			var lane = requestUpdateLane(), update = createUpdate(lane);
			update.payload = payload;
			void 0 !== callback && null !== callback && (update.callback = callback);
			payload = enqueueUpdate(inst, update, lane);
			null !== payload && (scheduleUpdateOnFiber(payload, inst, lane), entangleTransitions(payload, inst, lane));
		},
		enqueueReplaceState: function(inst, payload, callback) {
			inst = inst._reactInternals;
			var lane = requestUpdateLane(), update = createUpdate(lane);
			update.tag = 1;
			update.payload = payload;
			void 0 !== callback && null !== callback && (update.callback = callback);
			payload = enqueueUpdate(inst, update, lane);
			null !== payload && (scheduleUpdateOnFiber(payload, inst, lane), entangleTransitions(payload, inst, lane));
		},
		enqueueForceUpdate: function(inst, callback) {
			inst = inst._reactInternals;
			var lane = requestUpdateLane(), update = createUpdate(lane);
			update.tag = 2;
			void 0 !== callback && null !== callback && (update.callback = callback);
			callback = enqueueUpdate(inst, update, lane);
			null !== callback && (scheduleUpdateOnFiber(callback, inst, lane), entangleTransitions(callback, inst, lane));
		}
	};
	function checkShouldComponentUpdate(workInProgress, ctor, oldProps, newProps, oldState, newState, nextContext) {
		workInProgress = workInProgress.stateNode;
		return "function" === typeof workInProgress.shouldComponentUpdate ? workInProgress.shouldComponentUpdate(newProps, newState, nextContext) : ctor.prototype && ctor.prototype.isPureReactComponent ? !shallowEqual(oldProps, newProps) || !shallowEqual(oldState, newState) : !0;
	}
	function callComponentWillReceiveProps(workInProgress, instance, newProps, nextContext) {
		workInProgress = instance.state;
		"function" === typeof instance.componentWillReceiveProps && instance.componentWillReceiveProps(newProps, nextContext);
		"function" === typeof instance.UNSAFE_componentWillReceiveProps && instance.UNSAFE_componentWillReceiveProps(newProps, nextContext);
		instance.state !== workInProgress && classComponentUpdater.enqueueReplaceState(instance, instance.state, null);
	}
	function resolveClassComponentProps(Component, baseProps) {
		var newProps = baseProps;
		if ("ref" in baseProps) {
			newProps = {};
			for (var propName in baseProps) "ref" !== propName && (newProps[propName] = baseProps[propName]);
		}
		if (Component = Component.defaultProps) {
			newProps === baseProps && (newProps = assign({}, newProps));
			for (var propName$73 in Component) void 0 === newProps[propName$73] && (newProps[propName$73] = Component[propName$73]);
		}
		return newProps;
	}
	function defaultOnUncaughtError(error) {
		reportGlobalError(error);
	}
	function defaultOnCaughtError(error) {
		console.error(error);
	}
	function defaultOnRecoverableError(error) {
		reportGlobalError(error);
	}
	function logUncaughtError(root, errorInfo) {
		try {
			var onUncaughtError = root.onUncaughtError;
			onUncaughtError(errorInfo.value, { componentStack: errorInfo.stack });
		} catch (e$74) {
			setTimeout(function() {
				throw e$74;
			});
		}
	}
	function logCaughtError(root, boundary, errorInfo) {
		try {
			var onCaughtError = root.onCaughtError;
			onCaughtError(errorInfo.value, {
				componentStack: errorInfo.stack,
				errorBoundary: 1 === boundary.tag ? boundary.stateNode : null
			});
		} catch (e$75) {
			setTimeout(function() {
				throw e$75;
			});
		}
	}
	function createRootErrorUpdate(root, errorInfo, lane) {
		lane = createUpdate(lane);
		lane.tag = 3;
		lane.payload = { element: null };
		lane.callback = function() {
			logUncaughtError(root, errorInfo);
		};
		return lane;
	}
	function createClassErrorUpdate(lane) {
		lane = createUpdate(lane);
		lane.tag = 3;
		return lane;
	}
	function initializeClassErrorUpdate(update, root, fiber, errorInfo) {
		var getDerivedStateFromError = fiber.type.getDerivedStateFromError;
		if ("function" === typeof getDerivedStateFromError) {
			var error = errorInfo.value;
			update.payload = function() {
				return getDerivedStateFromError(error);
			};
			update.callback = function() {
				logCaughtError(root, fiber, errorInfo);
			};
		}
		var inst = fiber.stateNode;
		null !== inst && "function" === typeof inst.componentDidCatch && (update.callback = function() {
			logCaughtError(root, fiber, errorInfo);
			"function" !== typeof getDerivedStateFromError && (null === legacyErrorBoundariesThatAlreadyFailed ? legacyErrorBoundariesThatAlreadyFailed = new Set([this]) : legacyErrorBoundariesThatAlreadyFailed.add(this));
			var stack = errorInfo.stack;
			this.componentDidCatch(errorInfo.value, { componentStack: null !== stack ? stack : "" });
		});
	}
	function throwException(root, returnFiber, sourceFiber, value, rootRenderLanes) {
		sourceFiber.flags |= 32768;
		if (null !== value && "object" === typeof value && "function" === typeof value.then) {
			returnFiber = sourceFiber.alternate;
			null !== returnFiber && propagateParentContextChanges(returnFiber, sourceFiber, rootRenderLanes, !0);
			sourceFiber = suspenseHandlerStackCursor.current;
			if (null !== sourceFiber) {
				switch (sourceFiber.tag) {
					case 31:
					case 13: return null === shellBoundary ? renderDidSuspendDelayIfPossible() : null === sourceFiber.alternate && 0 === workInProgressRootExitStatus && (workInProgressRootExitStatus = 3), sourceFiber.flags &= -257, sourceFiber.flags |= 65536, sourceFiber.lanes = rootRenderLanes, value === noopSuspenseyCommitThenable ? sourceFiber.flags |= 16384 : (returnFiber = sourceFiber.updateQueue, null === returnFiber ? sourceFiber.updateQueue = new Set([value]) : returnFiber.add(value), attachPingListener(root, value, rootRenderLanes)), !1;
					case 22: return sourceFiber.flags |= 65536, value === noopSuspenseyCommitThenable ? sourceFiber.flags |= 16384 : (returnFiber = sourceFiber.updateQueue, null === returnFiber ? (returnFiber = {
						transitions: null,
						markerInstances: null,
						retryQueue: new Set([value])
					}, sourceFiber.updateQueue = returnFiber) : (sourceFiber = returnFiber.retryQueue, null === sourceFiber ? returnFiber.retryQueue = new Set([value]) : sourceFiber.add(value)), attachPingListener(root, value, rootRenderLanes)), !1;
				}
				throw Error(formatProdErrorMessage(435, sourceFiber.tag));
			}
			attachPingListener(root, value, rootRenderLanes);
			renderDidSuspendDelayIfPossible();
			return !1;
		}
		if (isHydrating) return returnFiber = suspenseHandlerStackCursor.current, null !== returnFiber ? (0 === (returnFiber.flags & 65536) && (returnFiber.flags |= 256), returnFiber.flags |= 65536, returnFiber.lanes = rootRenderLanes, value !== HydrationMismatchException && (root = Error(formatProdErrorMessage(422), { cause: value }), queueHydrationError(createCapturedValueAtFiber(root, sourceFiber)))) : (value !== HydrationMismatchException && (returnFiber = Error(formatProdErrorMessage(423), { cause: value }), queueHydrationError(createCapturedValueAtFiber(returnFiber, sourceFiber))), root = root.current.alternate, root.flags |= 65536, rootRenderLanes &= -rootRenderLanes, root.lanes |= rootRenderLanes, value = createCapturedValueAtFiber(value, sourceFiber), rootRenderLanes = createRootErrorUpdate(root.stateNode, value, rootRenderLanes), enqueueCapturedUpdate(root, rootRenderLanes), 4 !== workInProgressRootExitStatus && (workInProgressRootExitStatus = 2)), !1;
		var wrapperError = Error(formatProdErrorMessage(520), { cause: value });
		wrapperError = createCapturedValueAtFiber(wrapperError, sourceFiber);
		null === workInProgressRootConcurrentErrors ? workInProgressRootConcurrentErrors = [wrapperError] : workInProgressRootConcurrentErrors.push(wrapperError);
		4 !== workInProgressRootExitStatus && (workInProgressRootExitStatus = 2);
		if (null === returnFiber) return !0;
		value = createCapturedValueAtFiber(value, sourceFiber);
		sourceFiber = returnFiber;
		do {
			switch (sourceFiber.tag) {
				case 3: return sourceFiber.flags |= 65536, root = rootRenderLanes & -rootRenderLanes, sourceFiber.lanes |= root, root = createRootErrorUpdate(sourceFiber.stateNode, value, root), enqueueCapturedUpdate(sourceFiber, root), !1;
				case 1: if (returnFiber = sourceFiber.type, wrapperError = sourceFiber.stateNode, 0 === (sourceFiber.flags & 128) && ("function" === typeof returnFiber.getDerivedStateFromError || null !== wrapperError && "function" === typeof wrapperError.componentDidCatch && (null === legacyErrorBoundariesThatAlreadyFailed || !legacyErrorBoundariesThatAlreadyFailed.has(wrapperError)))) return sourceFiber.flags |= 65536, rootRenderLanes &= -rootRenderLanes, sourceFiber.lanes |= rootRenderLanes, rootRenderLanes = createClassErrorUpdate(rootRenderLanes), initializeClassErrorUpdate(rootRenderLanes, root, sourceFiber, value), enqueueCapturedUpdate(sourceFiber, rootRenderLanes), !1;
			}
			sourceFiber = sourceFiber.return;
		} while (null !== sourceFiber);
		return !1;
	}
	var SelectiveHydrationException = Error(formatProdErrorMessage(461)), didReceiveUpdate = !1;
	function reconcileChildren(current, workInProgress, nextChildren, renderLanes) {
		workInProgress.child = null === current ? mountChildFibers(workInProgress, null, nextChildren, renderLanes) : reconcileChildFibers(workInProgress, current.child, nextChildren, renderLanes);
	}
	function updateForwardRef(current, workInProgress, Component, nextProps, renderLanes) {
		Component = Component.render;
		var ref = workInProgress.ref;
		if ("ref" in nextProps) {
			var propsWithoutRef = {};
			for (var key in nextProps) "ref" !== key && (propsWithoutRef[key] = nextProps[key]);
		} else propsWithoutRef = nextProps;
		prepareToReadContext(workInProgress);
		nextProps = renderWithHooks(current, workInProgress, Component, propsWithoutRef, ref, renderLanes);
		key = checkDidRenderIdHook();
		if (null !== current && !didReceiveUpdate) return bailoutHooks(current, workInProgress, renderLanes), bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
		isHydrating && key && pushMaterializedTreeId(workInProgress);
		workInProgress.flags |= 1;
		reconcileChildren(current, workInProgress, nextProps, renderLanes);
		return workInProgress.child;
	}
	function updateMemoComponent(current, workInProgress, Component, nextProps, renderLanes) {
		if (null === current) {
			var type = Component.type;
			if ("function" === typeof type && !shouldConstruct(type) && void 0 === type.defaultProps && null === Component.compare) return workInProgress.tag = 15, workInProgress.type = type, updateSimpleMemoComponent(current, workInProgress, type, nextProps, renderLanes);
			current = createFiberFromTypeAndProps(Component.type, null, nextProps, workInProgress, workInProgress.mode, renderLanes);
			current.ref = workInProgress.ref;
			current.return = workInProgress;
			return workInProgress.child = current;
		}
		type = current.child;
		if (!checkScheduledUpdateOrContext(current, renderLanes)) {
			var prevProps = type.memoizedProps;
			Component = Component.compare;
			Component = null !== Component ? Component : shallowEqual;
			if (Component(prevProps, nextProps) && current.ref === workInProgress.ref) return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
		}
		workInProgress.flags |= 1;
		current = createWorkInProgress(type, nextProps);
		current.ref = workInProgress.ref;
		current.return = workInProgress;
		return workInProgress.child = current;
	}
	function updateSimpleMemoComponent(current, workInProgress, Component, nextProps, renderLanes) {
		if (null !== current) {
			var prevProps = current.memoizedProps;
			if (shallowEqual(prevProps, nextProps) && current.ref === workInProgress.ref) if (didReceiveUpdate = !1, workInProgress.pendingProps = nextProps = prevProps, checkScheduledUpdateOrContext(current, renderLanes)) 0 !== (current.flags & 131072) && (didReceiveUpdate = !0);
			else return workInProgress.lanes = current.lanes, bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
		}
		return updateFunctionComponent(current, workInProgress, Component, nextProps, renderLanes);
	}
	function updateOffscreenComponent(current, workInProgress, renderLanes, nextProps) {
		var nextChildren = nextProps.children, prevState = null !== current ? current.memoizedState : null;
		null === current && null === workInProgress.stateNode && (workInProgress.stateNode = {
			_visibility: 1,
			_pendingMarkers: null,
			_retryCache: null,
			_transitions: null
		});
		if ("hidden" === nextProps.mode) {
			if (0 !== (workInProgress.flags & 128)) {
				prevState = null !== prevState ? prevState.baseLanes | renderLanes : renderLanes;
				if (null !== current) {
					nextProps = workInProgress.child = current.child;
					for (nextChildren = 0; null !== nextProps;) nextChildren = nextChildren | nextProps.lanes | nextProps.childLanes, nextProps = nextProps.sibling;
					nextProps = nextChildren & ~prevState;
				} else nextProps = 0, workInProgress.child = null;
				return deferHiddenOffscreenComponent(current, workInProgress, prevState, renderLanes, nextProps);
			}
			if (0 !== (renderLanes & 536870912)) workInProgress.memoizedState = {
				baseLanes: 0,
				cachePool: null
			}, null !== current && pushTransition(workInProgress, null !== prevState ? prevState.cachePool : null), null !== prevState ? pushHiddenContext(workInProgress, prevState) : reuseHiddenContextOnStack(), pushOffscreenSuspenseHandler(workInProgress);
			else return nextProps = workInProgress.lanes = 536870912, deferHiddenOffscreenComponent(current, workInProgress, null !== prevState ? prevState.baseLanes | renderLanes : renderLanes, renderLanes, nextProps);
		} else null !== prevState ? (pushTransition(workInProgress, prevState.cachePool), pushHiddenContext(workInProgress, prevState), reuseSuspenseHandlerOnStack(workInProgress), workInProgress.memoizedState = null) : (null !== current && pushTransition(workInProgress, null), reuseHiddenContextOnStack(), reuseSuspenseHandlerOnStack(workInProgress));
		reconcileChildren(current, workInProgress, nextChildren, renderLanes);
		return workInProgress.child;
	}
	function bailoutOffscreenComponent(current, workInProgress) {
		null !== current && 22 === current.tag || null !== workInProgress.stateNode || (workInProgress.stateNode = {
			_visibility: 1,
			_pendingMarkers: null,
			_retryCache: null,
			_transitions: null
		});
		return workInProgress.sibling;
	}
	function deferHiddenOffscreenComponent(current, workInProgress, nextBaseLanes, renderLanes, remainingChildLanes) {
		var JSCompiler_inline_result = peekCacheFromPool();
		JSCompiler_inline_result = null === JSCompiler_inline_result ? null : {
			parent: CacheContext._currentValue,
			pool: JSCompiler_inline_result
		};
		workInProgress.memoizedState = {
			baseLanes: nextBaseLanes,
			cachePool: JSCompiler_inline_result
		};
		null !== current && pushTransition(workInProgress, null);
		reuseHiddenContextOnStack();
		pushOffscreenSuspenseHandler(workInProgress);
		null !== current && propagateParentContextChanges(current, workInProgress, renderLanes, !0);
		workInProgress.childLanes = remainingChildLanes;
		return null;
	}
	function mountActivityChildren(workInProgress, nextProps) {
		nextProps = mountWorkInProgressOffscreenFiber({
			mode: nextProps.mode,
			children: nextProps.children
		}, workInProgress.mode);
		nextProps.ref = workInProgress.ref;
		workInProgress.child = nextProps;
		nextProps.return = workInProgress;
		return nextProps;
	}
	function retryActivityComponentWithoutHydrating(current, workInProgress, renderLanes) {
		reconcileChildFibers(workInProgress, current.child, null, renderLanes);
		current = mountActivityChildren(workInProgress, workInProgress.pendingProps);
		current.flags |= 2;
		popSuspenseHandler(workInProgress);
		workInProgress.memoizedState = null;
		return current;
	}
	function updateActivityComponent(current, workInProgress, renderLanes) {
		var nextProps = workInProgress.pendingProps, didSuspend = 0 !== (workInProgress.flags & 128);
		workInProgress.flags &= -129;
		if (null === current) {
			if (isHydrating) {
				if ("hidden" === nextProps.mode) return current = mountActivityChildren(workInProgress, nextProps), workInProgress.lanes = 536870912, bailoutOffscreenComponent(null, current);
				pushDehydratedActivitySuspenseHandler(workInProgress);
				(current = nextHydratableInstance) ? (current = canHydrateHydrationBoundary(current, rootOrSingletonContext), current = null !== current && "&" === current.data ? current : null, null !== current && (workInProgress.memoizedState = {
					dehydrated: current,
					treeContext: null !== treeContextProvider ? {
						id: treeContextId,
						overflow: treeContextOverflow
					} : null,
					retryLane: 536870912,
					hydrationErrors: null
				}, renderLanes = createFiberFromDehydratedFragment(current), renderLanes.return = workInProgress, workInProgress.child = renderLanes, hydrationParentFiber = workInProgress, nextHydratableInstance = null)) : current = null;
				if (null === current) throw throwOnHydrationMismatch(workInProgress);
				workInProgress.lanes = 536870912;
				return null;
			}
			return mountActivityChildren(workInProgress, nextProps);
		}
		var prevState = current.memoizedState;
		if (null !== prevState) {
			var dehydrated = prevState.dehydrated;
			pushDehydratedActivitySuspenseHandler(workInProgress);
			if (didSuspend) if (workInProgress.flags & 256) workInProgress.flags &= -257, workInProgress = retryActivityComponentWithoutHydrating(current, workInProgress, renderLanes);
			else if (null !== workInProgress.memoizedState) workInProgress.child = current.child, workInProgress.flags |= 128, workInProgress = null;
			else throw Error(formatProdErrorMessage(558));
			else if (didReceiveUpdate || propagateParentContextChanges(current, workInProgress, renderLanes, !1), didSuspend = 0 !== (renderLanes & current.childLanes), didReceiveUpdate || didSuspend) {
				nextProps = workInProgressRoot;
				if (null !== nextProps && (dehydrated = getBumpedLaneForHydration(nextProps, renderLanes), 0 !== dehydrated && dehydrated !== prevState.retryLane)) throw prevState.retryLane = dehydrated, enqueueConcurrentRenderForLane(current, dehydrated), scheduleUpdateOnFiber(nextProps, current, dehydrated), SelectiveHydrationException;
				renderDidSuspendDelayIfPossible();
				workInProgress = retryActivityComponentWithoutHydrating(current, workInProgress, renderLanes);
			} else current = prevState.treeContext, nextHydratableInstance = getNextHydratable(dehydrated.nextSibling), hydrationParentFiber = workInProgress, isHydrating = !0, hydrationErrors = null, rootOrSingletonContext = !1, null !== current && restoreSuspendedTreeContext(workInProgress, current), workInProgress = mountActivityChildren(workInProgress, nextProps), workInProgress.flags |= 4096;
			return workInProgress;
		}
		current = createWorkInProgress(current.child, {
			mode: nextProps.mode,
			children: nextProps.children
		});
		current.ref = workInProgress.ref;
		workInProgress.child = current;
		current.return = workInProgress;
		return current;
	}
	function markRef(current, workInProgress) {
		var ref = workInProgress.ref;
		if (null === ref) null !== current && null !== current.ref && (workInProgress.flags |= 4194816);
		else {
			if ("function" !== typeof ref && "object" !== typeof ref) throw Error(formatProdErrorMessage(284));
			if (null === current || current.ref !== ref) workInProgress.flags |= 4194816;
		}
	}
	function updateFunctionComponent(current, workInProgress, Component, nextProps, renderLanes) {
		prepareToReadContext(workInProgress);
		Component = renderWithHooks(current, workInProgress, Component, nextProps, void 0, renderLanes);
		nextProps = checkDidRenderIdHook();
		if (null !== current && !didReceiveUpdate) return bailoutHooks(current, workInProgress, renderLanes), bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
		isHydrating && nextProps && pushMaterializedTreeId(workInProgress);
		workInProgress.flags |= 1;
		reconcileChildren(current, workInProgress, Component, renderLanes);
		return workInProgress.child;
	}
	function replayFunctionComponent(current, workInProgress, nextProps, Component, secondArg, renderLanes) {
		prepareToReadContext(workInProgress);
		workInProgress.updateQueue = null;
		nextProps = renderWithHooksAgain(workInProgress, Component, nextProps, secondArg);
		finishRenderingHooks(current);
		Component = checkDidRenderIdHook();
		if (null !== current && !didReceiveUpdate) return bailoutHooks(current, workInProgress, renderLanes), bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
		isHydrating && Component && pushMaterializedTreeId(workInProgress);
		workInProgress.flags |= 1;
		reconcileChildren(current, workInProgress, nextProps, renderLanes);
		return workInProgress.child;
	}
	function updateClassComponent(current, workInProgress, Component, nextProps, renderLanes) {
		prepareToReadContext(workInProgress);
		if (null === workInProgress.stateNode) {
			var context = emptyContextObject, contextType = Component.contextType;
			"object" === typeof contextType && null !== contextType && (context = readContext(contextType));
			context = new Component(nextProps, context);
			workInProgress.memoizedState = null !== context.state && void 0 !== context.state ? context.state : null;
			context.updater = classComponentUpdater;
			workInProgress.stateNode = context;
			context._reactInternals = workInProgress;
			context = workInProgress.stateNode;
			context.props = nextProps;
			context.state = workInProgress.memoizedState;
			context.refs = {};
			initializeUpdateQueue(workInProgress);
			contextType = Component.contextType;
			context.context = "object" === typeof contextType && null !== contextType ? readContext(contextType) : emptyContextObject;
			context.state = workInProgress.memoizedState;
			contextType = Component.getDerivedStateFromProps;
			"function" === typeof contextType && (applyDerivedStateFromProps(workInProgress, Component, contextType, nextProps), context.state = workInProgress.memoizedState);
			"function" === typeof Component.getDerivedStateFromProps || "function" === typeof context.getSnapshotBeforeUpdate || "function" !== typeof context.UNSAFE_componentWillMount && "function" !== typeof context.componentWillMount || (contextType = context.state, "function" === typeof context.componentWillMount && context.componentWillMount(), "function" === typeof context.UNSAFE_componentWillMount && context.UNSAFE_componentWillMount(), contextType !== context.state && classComponentUpdater.enqueueReplaceState(context, context.state, null), processUpdateQueue(workInProgress, nextProps, context, renderLanes), suspendIfUpdateReadFromEntangledAsyncAction(), context.state = workInProgress.memoizedState);
			"function" === typeof context.componentDidMount && (workInProgress.flags |= 4194308);
			nextProps = !0;
		} else if (null === current) {
			context = workInProgress.stateNode;
			var unresolvedOldProps = workInProgress.memoizedProps, oldProps = resolveClassComponentProps(Component, unresolvedOldProps);
			context.props = oldProps;
			var oldContext = context.context, contextType$jscomp$0 = Component.contextType;
			contextType = emptyContextObject;
			"object" === typeof contextType$jscomp$0 && null !== contextType$jscomp$0 && (contextType = readContext(contextType$jscomp$0));
			var getDerivedStateFromProps = Component.getDerivedStateFromProps;
			contextType$jscomp$0 = "function" === typeof getDerivedStateFromProps || "function" === typeof context.getSnapshotBeforeUpdate;
			unresolvedOldProps = workInProgress.pendingProps !== unresolvedOldProps;
			contextType$jscomp$0 || "function" !== typeof context.UNSAFE_componentWillReceiveProps && "function" !== typeof context.componentWillReceiveProps || (unresolvedOldProps || oldContext !== contextType) && callComponentWillReceiveProps(workInProgress, context, nextProps, contextType);
			hasForceUpdate = !1;
			var oldState = workInProgress.memoizedState;
			context.state = oldState;
			processUpdateQueue(workInProgress, nextProps, context, renderLanes);
			suspendIfUpdateReadFromEntangledAsyncAction();
			oldContext = workInProgress.memoizedState;
			unresolvedOldProps || oldState !== oldContext || hasForceUpdate ? ("function" === typeof getDerivedStateFromProps && (applyDerivedStateFromProps(workInProgress, Component, getDerivedStateFromProps, nextProps), oldContext = workInProgress.memoizedState), (oldProps = hasForceUpdate || checkShouldComponentUpdate(workInProgress, Component, oldProps, nextProps, oldState, oldContext, contextType)) ? (contextType$jscomp$0 || "function" !== typeof context.UNSAFE_componentWillMount && "function" !== typeof context.componentWillMount || ("function" === typeof context.componentWillMount && context.componentWillMount(), "function" === typeof context.UNSAFE_componentWillMount && context.UNSAFE_componentWillMount()), "function" === typeof context.componentDidMount && (workInProgress.flags |= 4194308)) : ("function" === typeof context.componentDidMount && (workInProgress.flags |= 4194308), workInProgress.memoizedProps = nextProps, workInProgress.memoizedState = oldContext), context.props = nextProps, context.state = oldContext, context.context = contextType, nextProps = oldProps) : ("function" === typeof context.componentDidMount && (workInProgress.flags |= 4194308), nextProps = !1);
		} else {
			context = workInProgress.stateNode;
			cloneUpdateQueue(current, workInProgress);
			contextType = workInProgress.memoizedProps;
			contextType$jscomp$0 = resolveClassComponentProps(Component, contextType);
			context.props = contextType$jscomp$0;
			getDerivedStateFromProps = workInProgress.pendingProps;
			oldState = context.context;
			oldContext = Component.contextType;
			oldProps = emptyContextObject;
			"object" === typeof oldContext && null !== oldContext && (oldProps = readContext(oldContext));
			unresolvedOldProps = Component.getDerivedStateFromProps;
			(oldContext = "function" === typeof unresolvedOldProps || "function" === typeof context.getSnapshotBeforeUpdate) || "function" !== typeof context.UNSAFE_componentWillReceiveProps && "function" !== typeof context.componentWillReceiveProps || (contextType !== getDerivedStateFromProps || oldState !== oldProps) && callComponentWillReceiveProps(workInProgress, context, nextProps, oldProps);
			hasForceUpdate = !1;
			oldState = workInProgress.memoizedState;
			context.state = oldState;
			processUpdateQueue(workInProgress, nextProps, context, renderLanes);
			suspendIfUpdateReadFromEntangledAsyncAction();
			var newState = workInProgress.memoizedState;
			contextType !== getDerivedStateFromProps || oldState !== newState || hasForceUpdate || null !== current && null !== current.dependencies && checkIfContextChanged(current.dependencies) ? ("function" === typeof unresolvedOldProps && (applyDerivedStateFromProps(workInProgress, Component, unresolvedOldProps, nextProps), newState = workInProgress.memoizedState), (contextType$jscomp$0 = hasForceUpdate || checkShouldComponentUpdate(workInProgress, Component, contextType$jscomp$0, nextProps, oldState, newState, oldProps) || null !== current && null !== current.dependencies && checkIfContextChanged(current.dependencies)) ? (oldContext || "function" !== typeof context.UNSAFE_componentWillUpdate && "function" !== typeof context.componentWillUpdate || ("function" === typeof context.componentWillUpdate && context.componentWillUpdate(nextProps, newState, oldProps), "function" === typeof context.UNSAFE_componentWillUpdate && context.UNSAFE_componentWillUpdate(nextProps, newState, oldProps)), "function" === typeof context.componentDidUpdate && (workInProgress.flags |= 4), "function" === typeof context.getSnapshotBeforeUpdate && (workInProgress.flags |= 1024)) : ("function" !== typeof context.componentDidUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress.flags |= 4), "function" !== typeof context.getSnapshotBeforeUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress.flags |= 1024), workInProgress.memoizedProps = nextProps, workInProgress.memoizedState = newState), context.props = nextProps, context.state = newState, context.context = oldProps, nextProps = contextType$jscomp$0) : ("function" !== typeof context.componentDidUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress.flags |= 4), "function" !== typeof context.getSnapshotBeforeUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress.flags |= 1024), nextProps = !1);
		}
		context = nextProps;
		markRef(current, workInProgress);
		nextProps = 0 !== (workInProgress.flags & 128);
		context || nextProps ? (context = workInProgress.stateNode, Component = nextProps && "function" !== typeof Component.getDerivedStateFromError ? null : context.render(), workInProgress.flags |= 1, null !== current && nextProps ? (workInProgress.child = reconcileChildFibers(workInProgress, current.child, null, renderLanes), workInProgress.child = reconcileChildFibers(workInProgress, null, Component, renderLanes)) : reconcileChildren(current, workInProgress, Component, renderLanes), workInProgress.memoizedState = context.state, current = workInProgress.child) : current = bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
		return current;
	}
	function mountHostRootWithoutHydrating(current, workInProgress, nextChildren, renderLanes) {
		resetHydrationState();
		workInProgress.flags |= 256;
		reconcileChildren(current, workInProgress, nextChildren, renderLanes);
		return workInProgress.child;
	}
	var SUSPENDED_MARKER = {
		dehydrated: null,
		treeContext: null,
		retryLane: 0,
		hydrationErrors: null
	};
	function mountSuspenseOffscreenState(renderLanes) {
		return {
			baseLanes: renderLanes,
			cachePool: getSuspendedCache()
		};
	}
	function getRemainingWorkInPrimaryTree(current, primaryTreeDidDefer, renderLanes) {
		current = null !== current ? current.childLanes & ~renderLanes : 0;
		primaryTreeDidDefer && (current |= workInProgressDeferredLane);
		return current;
	}
	function updateSuspenseComponent(current, workInProgress, renderLanes) {
		var nextProps = workInProgress.pendingProps, showFallback = !1, didSuspend = 0 !== (workInProgress.flags & 128), JSCompiler_temp;
		(JSCompiler_temp = didSuspend) || (JSCompiler_temp = null !== current && null === current.memoizedState ? !1 : 0 !== (suspenseStackCursor.current & 2));
		JSCompiler_temp && (showFallback = !0, workInProgress.flags &= -129);
		JSCompiler_temp = 0 !== (workInProgress.flags & 32);
		workInProgress.flags &= -33;
		if (null === current) {
			if (isHydrating) {
				showFallback ? pushPrimaryTreeSuspenseHandler(workInProgress) : reuseSuspenseHandlerOnStack(workInProgress);
				(current = nextHydratableInstance) ? (current = canHydrateHydrationBoundary(current, rootOrSingletonContext), current = null !== current && "&" !== current.data ? current : null, null !== current && (workInProgress.memoizedState = {
					dehydrated: current,
					treeContext: null !== treeContextProvider ? {
						id: treeContextId,
						overflow: treeContextOverflow
					} : null,
					retryLane: 536870912,
					hydrationErrors: null
				}, renderLanes = createFiberFromDehydratedFragment(current), renderLanes.return = workInProgress, workInProgress.child = renderLanes, hydrationParentFiber = workInProgress, nextHydratableInstance = null)) : current = null;
				if (null === current) throw throwOnHydrationMismatch(workInProgress);
				isSuspenseInstanceFallback(current) ? workInProgress.lanes = 32 : workInProgress.lanes = 536870912;
				return null;
			}
			var nextPrimaryChildren = nextProps.children;
			nextProps = nextProps.fallback;
			if (showFallback) return reuseSuspenseHandlerOnStack(workInProgress), showFallback = workInProgress.mode, nextPrimaryChildren = mountWorkInProgressOffscreenFiber({
				mode: "hidden",
				children: nextPrimaryChildren
			}, showFallback), nextProps = createFiberFromFragment(nextProps, showFallback, renderLanes, null), nextPrimaryChildren.return = workInProgress, nextProps.return = workInProgress, nextPrimaryChildren.sibling = nextProps, workInProgress.child = nextPrimaryChildren, nextProps = workInProgress.child, nextProps.memoizedState = mountSuspenseOffscreenState(renderLanes), nextProps.childLanes = getRemainingWorkInPrimaryTree(current, JSCompiler_temp, renderLanes), workInProgress.memoizedState = SUSPENDED_MARKER, bailoutOffscreenComponent(null, nextProps);
			pushPrimaryTreeSuspenseHandler(workInProgress);
			return mountSuspensePrimaryChildren(workInProgress, nextPrimaryChildren);
		}
		var prevState = current.memoizedState;
		if (null !== prevState && (nextPrimaryChildren = prevState.dehydrated, null !== nextPrimaryChildren)) {
			if (didSuspend) workInProgress.flags & 256 ? (pushPrimaryTreeSuspenseHandler(workInProgress), workInProgress.flags &= -257, workInProgress = retrySuspenseComponentWithoutHydrating(current, workInProgress, renderLanes)) : null !== workInProgress.memoizedState ? (reuseSuspenseHandlerOnStack(workInProgress), workInProgress.child = current.child, workInProgress.flags |= 128, workInProgress = null) : (reuseSuspenseHandlerOnStack(workInProgress), nextPrimaryChildren = nextProps.fallback, showFallback = workInProgress.mode, nextProps = mountWorkInProgressOffscreenFiber({
				mode: "visible",
				children: nextProps.children
			}, showFallback), nextPrimaryChildren = createFiberFromFragment(nextPrimaryChildren, showFallback, renderLanes, null), nextPrimaryChildren.flags |= 2, nextProps.return = workInProgress, nextPrimaryChildren.return = workInProgress, nextProps.sibling = nextPrimaryChildren, workInProgress.child = nextProps, reconcileChildFibers(workInProgress, current.child, null, renderLanes), nextProps = workInProgress.child, nextProps.memoizedState = mountSuspenseOffscreenState(renderLanes), nextProps.childLanes = getRemainingWorkInPrimaryTree(current, JSCompiler_temp, renderLanes), workInProgress.memoizedState = SUSPENDED_MARKER, workInProgress = bailoutOffscreenComponent(null, nextProps));
			else if (pushPrimaryTreeSuspenseHandler(workInProgress), isSuspenseInstanceFallback(nextPrimaryChildren)) {
				JSCompiler_temp = nextPrimaryChildren.nextSibling && nextPrimaryChildren.nextSibling.dataset;
				if (JSCompiler_temp) var digest = JSCompiler_temp.dgst;
				JSCompiler_temp = digest;
				nextProps = Error(formatProdErrorMessage(419));
				nextProps.stack = "";
				nextProps.digest = JSCompiler_temp;
				queueHydrationError({
					value: nextProps,
					source: null,
					stack: null
				});
				workInProgress = retrySuspenseComponentWithoutHydrating(current, workInProgress, renderLanes);
			} else if (didReceiveUpdate || propagateParentContextChanges(current, workInProgress, renderLanes, !1), JSCompiler_temp = 0 !== (renderLanes & current.childLanes), didReceiveUpdate || JSCompiler_temp) {
				JSCompiler_temp = workInProgressRoot;
				if (null !== JSCompiler_temp && (nextProps = getBumpedLaneForHydration(JSCompiler_temp, renderLanes), 0 !== nextProps && nextProps !== prevState.retryLane)) throw prevState.retryLane = nextProps, enqueueConcurrentRenderForLane(current, nextProps), scheduleUpdateOnFiber(JSCompiler_temp, current, nextProps), SelectiveHydrationException;
				isSuspenseInstancePending(nextPrimaryChildren) || renderDidSuspendDelayIfPossible();
				workInProgress = retrySuspenseComponentWithoutHydrating(current, workInProgress, renderLanes);
			} else isSuspenseInstancePending(nextPrimaryChildren) ? (workInProgress.flags |= 192, workInProgress.child = current.child, workInProgress = null) : (current = prevState.treeContext, nextHydratableInstance = getNextHydratable(nextPrimaryChildren.nextSibling), hydrationParentFiber = workInProgress, isHydrating = !0, hydrationErrors = null, rootOrSingletonContext = !1, null !== current && restoreSuspendedTreeContext(workInProgress, current), workInProgress = mountSuspensePrimaryChildren(workInProgress, nextProps.children), workInProgress.flags |= 4096);
			return workInProgress;
		}
		if (showFallback) return reuseSuspenseHandlerOnStack(workInProgress), nextPrimaryChildren = nextProps.fallback, showFallback = workInProgress.mode, prevState = current.child, digest = prevState.sibling, nextProps = createWorkInProgress(prevState, {
			mode: "hidden",
			children: nextProps.children
		}), nextProps.subtreeFlags = prevState.subtreeFlags & 65011712, null !== digest ? nextPrimaryChildren = createWorkInProgress(digest, nextPrimaryChildren) : (nextPrimaryChildren = createFiberFromFragment(nextPrimaryChildren, showFallback, renderLanes, null), nextPrimaryChildren.flags |= 2), nextPrimaryChildren.return = workInProgress, nextProps.return = workInProgress, nextProps.sibling = nextPrimaryChildren, workInProgress.child = nextProps, bailoutOffscreenComponent(null, nextProps), nextProps = workInProgress.child, nextPrimaryChildren = current.child.memoizedState, null === nextPrimaryChildren ? nextPrimaryChildren = mountSuspenseOffscreenState(renderLanes) : (showFallback = nextPrimaryChildren.cachePool, null !== showFallback ? (prevState = CacheContext._currentValue, showFallback = showFallback.parent !== prevState ? {
			parent: prevState,
			pool: prevState
		} : showFallback) : showFallback = getSuspendedCache(), nextPrimaryChildren = {
			baseLanes: nextPrimaryChildren.baseLanes | renderLanes,
			cachePool: showFallback
		}), nextProps.memoizedState = nextPrimaryChildren, nextProps.childLanes = getRemainingWorkInPrimaryTree(current, JSCompiler_temp, renderLanes), workInProgress.memoizedState = SUSPENDED_MARKER, bailoutOffscreenComponent(current.child, nextProps);
		pushPrimaryTreeSuspenseHandler(workInProgress);
		renderLanes = current.child;
		current = renderLanes.sibling;
		renderLanes = createWorkInProgress(renderLanes, {
			mode: "visible",
			children: nextProps.children
		});
		renderLanes.return = workInProgress;
		renderLanes.sibling = null;
		null !== current && (JSCompiler_temp = workInProgress.deletions, null === JSCompiler_temp ? (workInProgress.deletions = [current], workInProgress.flags |= 16) : JSCompiler_temp.push(current));
		workInProgress.child = renderLanes;
		workInProgress.memoizedState = null;
		return renderLanes;
	}
	function mountSuspensePrimaryChildren(workInProgress, primaryChildren) {
		primaryChildren = mountWorkInProgressOffscreenFiber({
			mode: "visible",
			children: primaryChildren
		}, workInProgress.mode);
		primaryChildren.return = workInProgress;
		return workInProgress.child = primaryChildren;
	}
	function mountWorkInProgressOffscreenFiber(offscreenProps, mode) {
		offscreenProps = createFiberImplClass(22, offscreenProps, null, mode);
		offscreenProps.lanes = 0;
		return offscreenProps;
	}
	function retrySuspenseComponentWithoutHydrating(current, workInProgress, renderLanes) {
		reconcileChildFibers(workInProgress, current.child, null, renderLanes);
		current = mountSuspensePrimaryChildren(workInProgress, workInProgress.pendingProps.children);
		current.flags |= 2;
		workInProgress.memoizedState = null;
		return current;
	}
	function scheduleSuspenseWorkOnFiber(fiber, renderLanes, propagationRoot) {
		fiber.lanes |= renderLanes;
		var alternate = fiber.alternate;
		null !== alternate && (alternate.lanes |= renderLanes);
		scheduleContextWorkOnParentPath(fiber.return, renderLanes, propagationRoot);
	}
	function initSuspenseListRenderState(workInProgress, isBackwards, tail, lastContentRow, tailMode, treeForkCount) {
		var renderState = workInProgress.memoizedState;
		null === renderState ? workInProgress.memoizedState = {
			isBackwards,
			rendering: null,
			renderingStartTime: 0,
			last: lastContentRow,
			tail,
			tailMode,
			treeForkCount
		} : (renderState.isBackwards = isBackwards, renderState.rendering = null, renderState.renderingStartTime = 0, renderState.last = lastContentRow, renderState.tail = tail, renderState.tailMode = tailMode, renderState.treeForkCount = treeForkCount);
	}
	function updateSuspenseListComponent(current, workInProgress, renderLanes) {
		var nextProps = workInProgress.pendingProps, revealOrder = nextProps.revealOrder, tailMode = nextProps.tail;
		nextProps = nextProps.children;
		var suspenseContext = suspenseStackCursor.current, shouldForceFallback = 0 !== (suspenseContext & 2);
		shouldForceFallback ? (suspenseContext = suspenseContext & 1 | 2, workInProgress.flags |= 128) : suspenseContext &= 1;
		push(suspenseStackCursor, suspenseContext);
		reconcileChildren(current, workInProgress, nextProps, renderLanes);
		nextProps = isHydrating ? treeForkCount : 0;
		if (!shouldForceFallback && null !== current && 0 !== (current.flags & 128)) a: for (current = workInProgress.child; null !== current;) {
			if (13 === current.tag) null !== current.memoizedState && scheduleSuspenseWorkOnFiber(current, renderLanes, workInProgress);
			else if (19 === current.tag) scheduleSuspenseWorkOnFiber(current, renderLanes, workInProgress);
			else if (null !== current.child) {
				current.child.return = current;
				current = current.child;
				continue;
			}
			if (current === workInProgress) break a;
			for (; null === current.sibling;) {
				if (null === current.return || current.return === workInProgress) break a;
				current = current.return;
			}
			current.sibling.return = current.return;
			current = current.sibling;
		}
		switch (revealOrder) {
			case "forwards":
				renderLanes = workInProgress.child;
				for (revealOrder = null; null !== renderLanes;) current = renderLanes.alternate, null !== current && null === findFirstSuspended(current) && (revealOrder = renderLanes), renderLanes = renderLanes.sibling;
				renderLanes = revealOrder;
				null === renderLanes ? (revealOrder = workInProgress.child, workInProgress.child = null) : (revealOrder = renderLanes.sibling, renderLanes.sibling = null);
				initSuspenseListRenderState(workInProgress, !1, revealOrder, renderLanes, tailMode, nextProps);
				break;
			case "backwards":
			case "unstable_legacy-backwards":
				renderLanes = null;
				revealOrder = workInProgress.child;
				for (workInProgress.child = null; null !== revealOrder;) {
					current = revealOrder.alternate;
					if (null !== current && null === findFirstSuspended(current)) {
						workInProgress.child = revealOrder;
						break;
					}
					current = revealOrder.sibling;
					revealOrder.sibling = renderLanes;
					renderLanes = revealOrder;
					revealOrder = current;
				}
				initSuspenseListRenderState(workInProgress, !0, renderLanes, null, tailMode, nextProps);
				break;
			case "together":
				initSuspenseListRenderState(workInProgress, !1, null, null, void 0, nextProps);
				break;
			default: workInProgress.memoizedState = null;
		}
		return workInProgress.child;
	}
	function bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes) {
		null !== current && (workInProgress.dependencies = current.dependencies);
		workInProgressRootSkippedLanes |= workInProgress.lanes;
		if (0 === (renderLanes & workInProgress.childLanes)) if (null !== current) {
			if (propagateParentContextChanges(current, workInProgress, renderLanes, !1), 0 === (renderLanes & workInProgress.childLanes)) return null;
		} else return null;
		if (null !== current && workInProgress.child !== current.child) throw Error(formatProdErrorMessage(153));
		if (null !== workInProgress.child) {
			current = workInProgress.child;
			renderLanes = createWorkInProgress(current, current.pendingProps);
			workInProgress.child = renderLanes;
			for (renderLanes.return = workInProgress; null !== current.sibling;) current = current.sibling, renderLanes = renderLanes.sibling = createWorkInProgress(current, current.pendingProps), renderLanes.return = workInProgress;
			renderLanes.sibling = null;
		}
		return workInProgress.child;
	}
	function checkScheduledUpdateOrContext(current, renderLanes) {
		if (0 !== (current.lanes & renderLanes)) return !0;
		current = current.dependencies;
		return null !== current && checkIfContextChanged(current) ? !0 : !1;
	}
	function attemptEarlyBailoutIfNoScheduledUpdate(current, workInProgress, renderLanes) {
		switch (workInProgress.tag) {
			case 3:
				pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo);
				pushProvider(workInProgress, CacheContext, current.memoizedState.cache);
				resetHydrationState();
				break;
			case 27:
			case 5:
				pushHostContext(workInProgress);
				break;
			case 4:
				pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo);
				break;
			case 10:
				pushProvider(workInProgress, workInProgress.type, workInProgress.memoizedProps.value);
				break;
			case 31:
				if (null !== workInProgress.memoizedState) return workInProgress.flags |= 128, pushDehydratedActivitySuspenseHandler(workInProgress), null;
				break;
			case 13:
				var state$102 = workInProgress.memoizedState;
				if (null !== state$102) {
					if (null !== state$102.dehydrated) return pushPrimaryTreeSuspenseHandler(workInProgress), workInProgress.flags |= 128, null;
					if (0 !== (renderLanes & workInProgress.child.childLanes)) return updateSuspenseComponent(current, workInProgress, renderLanes);
					pushPrimaryTreeSuspenseHandler(workInProgress);
					current = bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
					return null !== current ? current.sibling : null;
				}
				pushPrimaryTreeSuspenseHandler(workInProgress);
				break;
			case 19:
				var didSuspendBefore = 0 !== (current.flags & 128);
				state$102 = 0 !== (renderLanes & workInProgress.childLanes);
				state$102 || (propagateParentContextChanges(current, workInProgress, renderLanes, !1), state$102 = 0 !== (renderLanes & workInProgress.childLanes));
				if (didSuspendBefore) {
					if (state$102) return updateSuspenseListComponent(current, workInProgress, renderLanes);
					workInProgress.flags |= 128;
				}
				didSuspendBefore = workInProgress.memoizedState;
				null !== didSuspendBefore && (didSuspendBefore.rendering = null, didSuspendBefore.tail = null, didSuspendBefore.lastEffect = null);
				push(suspenseStackCursor, suspenseStackCursor.current);
				if (state$102) break;
				else return null;
			case 22: return workInProgress.lanes = 0, updateOffscreenComponent(current, workInProgress, renderLanes, workInProgress.pendingProps);
			case 24: pushProvider(workInProgress, CacheContext, current.memoizedState.cache);
		}
		return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
	}
	function beginWork(current, workInProgress, renderLanes) {
		if (null !== current) if (current.memoizedProps !== workInProgress.pendingProps) didReceiveUpdate = !0;
		else {
			if (!checkScheduledUpdateOrContext(current, renderLanes) && 0 === (workInProgress.flags & 128)) return didReceiveUpdate = !1, attemptEarlyBailoutIfNoScheduledUpdate(current, workInProgress, renderLanes);
			didReceiveUpdate = 0 !== (current.flags & 131072) ? !0 : !1;
		}
		else didReceiveUpdate = !1, isHydrating && 0 !== (workInProgress.flags & 1048576) && pushTreeId(workInProgress, treeForkCount, workInProgress.index);
		workInProgress.lanes = 0;
		switch (workInProgress.tag) {
			case 16:
				a: {
					var props = workInProgress.pendingProps;
					current = resolveLazy(workInProgress.elementType);
					workInProgress.type = current;
					if ("function" === typeof current) shouldConstruct(current) ? (props = resolveClassComponentProps(current, props), workInProgress.tag = 1, workInProgress = updateClassComponent(null, workInProgress, current, props, renderLanes)) : (workInProgress.tag = 0, workInProgress = updateFunctionComponent(null, workInProgress, current, props, renderLanes));
					else {
						if (void 0 !== current && null !== current) {
							var $$typeof = current.$$typeof;
							if ($$typeof === REACT_FORWARD_REF_TYPE) {
								workInProgress.tag = 11;
								workInProgress = updateForwardRef(null, workInProgress, current, props, renderLanes);
								break a;
							} else if ($$typeof === REACT_MEMO_TYPE) {
								workInProgress.tag = 14;
								workInProgress = updateMemoComponent(null, workInProgress, current, props, renderLanes);
								break a;
							}
						}
						workInProgress = getComponentNameFromType(current) || current;
						throw Error(formatProdErrorMessage(306, workInProgress, ""));
					}
				}
				return workInProgress;
			case 0: return updateFunctionComponent(current, workInProgress, workInProgress.type, workInProgress.pendingProps, renderLanes);
			case 1: return props = workInProgress.type, $$typeof = resolveClassComponentProps(props, workInProgress.pendingProps), updateClassComponent(current, workInProgress, props, $$typeof, renderLanes);
			case 3:
				a: {
					pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo);
					if (null === current) throw Error(formatProdErrorMessage(387));
					props = workInProgress.pendingProps;
					var prevState = workInProgress.memoizedState;
					$$typeof = prevState.element;
					cloneUpdateQueue(current, workInProgress);
					processUpdateQueue(workInProgress, props, null, renderLanes);
					var nextState = workInProgress.memoizedState;
					props = nextState.cache;
					pushProvider(workInProgress, CacheContext, props);
					props !== prevState.cache && propagateContextChanges(workInProgress, [CacheContext], renderLanes, !0);
					suspendIfUpdateReadFromEntangledAsyncAction();
					props = nextState.element;
					if (prevState.isDehydrated) if (prevState = {
						element: props,
						isDehydrated: !1,
						cache: nextState.cache
					}, workInProgress.updateQueue.baseState = prevState, workInProgress.memoizedState = prevState, workInProgress.flags & 256) {
						workInProgress = mountHostRootWithoutHydrating(current, workInProgress, props, renderLanes);
						break a;
					} else if (props !== $$typeof) {
						$$typeof = createCapturedValueAtFiber(Error(formatProdErrorMessage(424)), workInProgress);
						queueHydrationError($$typeof);
						workInProgress = mountHostRootWithoutHydrating(current, workInProgress, props, renderLanes);
						break a;
					} else {
						current = workInProgress.stateNode.containerInfo;
						switch (current.nodeType) {
							case 9:
								current = current.body;
								break;
							default: current = "HTML" === current.nodeName ? current.ownerDocument.body : current;
						}
						nextHydratableInstance = getNextHydratable(current.firstChild);
						hydrationParentFiber = workInProgress;
						isHydrating = !0;
						hydrationErrors = null;
						rootOrSingletonContext = !0;
						renderLanes = mountChildFibers(workInProgress, null, props, renderLanes);
						for (workInProgress.child = renderLanes; renderLanes;) renderLanes.flags = renderLanes.flags & -3 | 4096, renderLanes = renderLanes.sibling;
					}
					else {
						resetHydrationState();
						if (props === $$typeof) {
							workInProgress = bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
							break a;
						}
						reconcileChildren(current, workInProgress, props, renderLanes);
					}
					workInProgress = workInProgress.child;
				}
				return workInProgress;
			case 26: return markRef(current, workInProgress), null === current ? (renderLanes = getResource(workInProgress.type, null, workInProgress.pendingProps, null)) ? workInProgress.memoizedState = renderLanes : isHydrating || (renderLanes = workInProgress.type, current = workInProgress.pendingProps, props = getOwnerDocumentFromRootContainer(rootInstanceStackCursor.current).createElement(renderLanes), props[internalInstanceKey] = workInProgress, props[internalPropsKey] = current, setInitialProperties(props, renderLanes, current), markNodeAsHoistable(props), workInProgress.stateNode = props) : workInProgress.memoizedState = getResource(workInProgress.type, current.memoizedProps, workInProgress.pendingProps, current.memoizedState), null;
			case 27: return pushHostContext(workInProgress), null === current && isHydrating && (props = workInProgress.stateNode = resolveSingletonInstance(workInProgress.type, workInProgress.pendingProps, rootInstanceStackCursor.current), hydrationParentFiber = workInProgress, rootOrSingletonContext = !0, $$typeof = nextHydratableInstance, isSingletonScope(workInProgress.type) ? (previousHydratableOnEnteringScopedSingleton = $$typeof, nextHydratableInstance = getNextHydratable(props.firstChild)) : nextHydratableInstance = $$typeof), reconcileChildren(current, workInProgress, workInProgress.pendingProps.children, renderLanes), markRef(current, workInProgress), null === current && (workInProgress.flags |= 4194304), workInProgress.child;
			case 5:
				if (null === current && isHydrating) {
					if ($$typeof = props = nextHydratableInstance) props = canHydrateInstance(props, workInProgress.type, workInProgress.pendingProps, rootOrSingletonContext), null !== props ? (workInProgress.stateNode = props, hydrationParentFiber = workInProgress, nextHydratableInstance = getNextHydratable(props.firstChild), rootOrSingletonContext = !1, $$typeof = !0) : $$typeof = !1;
					$$typeof || throwOnHydrationMismatch(workInProgress);
				}
				pushHostContext(workInProgress);
				$$typeof = workInProgress.type;
				prevState = workInProgress.pendingProps;
				nextState = null !== current ? current.memoizedProps : null;
				props = prevState.children;
				shouldSetTextContent($$typeof, prevState) ? props = null : null !== nextState && shouldSetTextContent($$typeof, nextState) && (workInProgress.flags |= 32);
				null !== workInProgress.memoizedState && ($$typeof = renderWithHooks(current, workInProgress, TransitionAwareHostComponent, null, null, renderLanes), HostTransitionContext._currentValue = $$typeof);
				markRef(current, workInProgress);
				reconcileChildren(current, workInProgress, props, renderLanes);
				return workInProgress.child;
			case 6:
				if (null === current && isHydrating) {
					if (current = renderLanes = nextHydratableInstance) renderLanes = canHydrateTextInstance(renderLanes, workInProgress.pendingProps, rootOrSingletonContext), null !== renderLanes ? (workInProgress.stateNode = renderLanes, hydrationParentFiber = workInProgress, nextHydratableInstance = null, current = !0) : current = !1;
					current || throwOnHydrationMismatch(workInProgress);
				}
				return null;
			case 13: return updateSuspenseComponent(current, workInProgress, renderLanes);
			case 4: return pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo), props = workInProgress.pendingProps, null === current ? workInProgress.child = reconcileChildFibers(workInProgress, null, props, renderLanes) : reconcileChildren(current, workInProgress, props, renderLanes), workInProgress.child;
			case 11: return updateForwardRef(current, workInProgress, workInProgress.type, workInProgress.pendingProps, renderLanes);
			case 7: return reconcileChildren(current, workInProgress, workInProgress.pendingProps, renderLanes), workInProgress.child;
			case 8: return reconcileChildren(current, workInProgress, workInProgress.pendingProps.children, renderLanes), workInProgress.child;
			case 12: return reconcileChildren(current, workInProgress, workInProgress.pendingProps.children, renderLanes), workInProgress.child;
			case 10: return props = workInProgress.pendingProps, pushProvider(workInProgress, workInProgress.type, props.value), reconcileChildren(current, workInProgress, props.children, renderLanes), workInProgress.child;
			case 9: return $$typeof = workInProgress.type._context, props = workInProgress.pendingProps.children, prepareToReadContext(workInProgress), $$typeof = readContext($$typeof), props = props($$typeof), workInProgress.flags |= 1, reconcileChildren(current, workInProgress, props, renderLanes), workInProgress.child;
			case 14: return updateMemoComponent(current, workInProgress, workInProgress.type, workInProgress.pendingProps, renderLanes);
			case 15: return updateSimpleMemoComponent(current, workInProgress, workInProgress.type, workInProgress.pendingProps, renderLanes);
			case 19: return updateSuspenseListComponent(current, workInProgress, renderLanes);
			case 31: return updateActivityComponent(current, workInProgress, renderLanes);
			case 22: return updateOffscreenComponent(current, workInProgress, renderLanes, workInProgress.pendingProps);
			case 24: return prepareToReadContext(workInProgress), props = readContext(CacheContext), null === current ? ($$typeof = peekCacheFromPool(), null === $$typeof && ($$typeof = workInProgressRoot, prevState = createCache(), $$typeof.pooledCache = prevState, prevState.refCount++, null !== prevState && ($$typeof.pooledCacheLanes |= renderLanes), $$typeof = prevState), workInProgress.memoizedState = {
				parent: props,
				cache: $$typeof
			}, initializeUpdateQueue(workInProgress), pushProvider(workInProgress, CacheContext, $$typeof)) : (0 !== (current.lanes & renderLanes) && (cloneUpdateQueue(current, workInProgress), processUpdateQueue(workInProgress, null, null, renderLanes), suspendIfUpdateReadFromEntangledAsyncAction()), $$typeof = current.memoizedState, prevState = workInProgress.memoizedState, $$typeof.parent !== props ? ($$typeof = {
				parent: props,
				cache: props
			}, workInProgress.memoizedState = $$typeof, 0 === workInProgress.lanes && (workInProgress.memoizedState = workInProgress.updateQueue.baseState = $$typeof), pushProvider(workInProgress, CacheContext, props)) : (props = prevState.cache, pushProvider(workInProgress, CacheContext, props), props !== $$typeof.cache && propagateContextChanges(workInProgress, [CacheContext], renderLanes, !0))), reconcileChildren(current, workInProgress, workInProgress.pendingProps.children, renderLanes), workInProgress.child;
			case 29: throw workInProgress.pendingProps;
		}
		throw Error(formatProdErrorMessage(156, workInProgress.tag));
	}
	function markUpdate(workInProgress) {
		workInProgress.flags |= 4;
	}
	function preloadInstanceAndSuspendIfNeeded(workInProgress, type, oldProps, newProps, renderLanes) {
		if (type = 0 !== (workInProgress.mode & 32)) type = !1;
		if (type) {
			if (workInProgress.flags |= 16777216, (renderLanes & 335544128) === renderLanes) if (workInProgress.stateNode.complete) workInProgress.flags |= 8192;
			else if (shouldRemainOnPreviousScreen()) workInProgress.flags |= 8192;
			else throw suspendedThenable = noopSuspenseyCommitThenable, SuspenseyCommitException;
		} else workInProgress.flags &= -16777217;
	}
	function preloadResourceAndSuspendIfNeeded(workInProgress, resource) {
		if ("stylesheet" !== resource.type || 0 !== (resource.state.loading & 4)) workInProgress.flags &= -16777217;
		else if (workInProgress.flags |= 16777216, !preloadResource(resource)) if (shouldRemainOnPreviousScreen()) workInProgress.flags |= 8192;
		else throw suspendedThenable = noopSuspenseyCommitThenable, SuspenseyCommitException;
	}
	function scheduleRetryEffect(workInProgress, retryQueue) {
		null !== retryQueue && (workInProgress.flags |= 4);
		workInProgress.flags & 16384 && (retryQueue = 22 !== workInProgress.tag ? claimNextRetryLane() : 536870912, workInProgress.lanes |= retryQueue, workInProgressSuspendedRetryLanes |= retryQueue);
	}
	function cutOffTailIfNeeded(renderState, hasRenderedATailFallback) {
		if (!isHydrating) switch (renderState.tailMode) {
			case "hidden":
				hasRenderedATailFallback = renderState.tail;
				for (var lastTailNode = null; null !== hasRenderedATailFallback;) null !== hasRenderedATailFallback.alternate && (lastTailNode = hasRenderedATailFallback), hasRenderedATailFallback = hasRenderedATailFallback.sibling;
				null === lastTailNode ? renderState.tail = null : lastTailNode.sibling = null;
				break;
			case "collapsed":
				lastTailNode = renderState.tail;
				for (var lastTailNode$106 = null; null !== lastTailNode;) null !== lastTailNode.alternate && (lastTailNode$106 = lastTailNode), lastTailNode = lastTailNode.sibling;
				null === lastTailNode$106 ? hasRenderedATailFallback || null === renderState.tail ? renderState.tail = null : renderState.tail.sibling = null : lastTailNode$106.sibling = null;
		}
	}
	function bubbleProperties(completedWork) {
		var didBailout = null !== completedWork.alternate && completedWork.alternate.child === completedWork.child, newChildLanes = 0, subtreeFlags = 0;
		if (didBailout) for (var child$107 = completedWork.child; null !== child$107;) newChildLanes |= child$107.lanes | child$107.childLanes, subtreeFlags |= child$107.subtreeFlags & 65011712, subtreeFlags |= child$107.flags & 65011712, child$107.return = completedWork, child$107 = child$107.sibling;
		else for (child$107 = completedWork.child; null !== child$107;) newChildLanes |= child$107.lanes | child$107.childLanes, subtreeFlags |= child$107.subtreeFlags, subtreeFlags |= child$107.flags, child$107.return = completedWork, child$107 = child$107.sibling;
		completedWork.subtreeFlags |= subtreeFlags;
		completedWork.childLanes = newChildLanes;
		return didBailout;
	}
	function completeWork(current, workInProgress, renderLanes) {
		var newProps = workInProgress.pendingProps;
		popTreeContext(workInProgress);
		switch (workInProgress.tag) {
			case 16:
			case 15:
			case 0:
			case 11:
			case 7:
			case 8:
			case 12:
			case 9:
			case 14: return bubbleProperties(workInProgress), null;
			case 1: return bubbleProperties(workInProgress), null;
			case 3:
				renderLanes = workInProgress.stateNode;
				newProps = null;
				null !== current && (newProps = current.memoizedState.cache);
				workInProgress.memoizedState.cache !== newProps && (workInProgress.flags |= 2048);
				popProvider(CacheContext);
				popHostContainer();
				renderLanes.pendingContext && (renderLanes.context = renderLanes.pendingContext, renderLanes.pendingContext = null);
				if (null === current || null === current.child) popHydrationState(workInProgress) ? markUpdate(workInProgress) : null === current || current.memoizedState.isDehydrated && 0 === (workInProgress.flags & 256) || (workInProgress.flags |= 1024, upgradeHydrationErrorsToRecoverable());
				bubbleProperties(workInProgress);
				return null;
			case 26:
				var type = workInProgress.type, nextResource = workInProgress.memoizedState;
				null === current ? (markUpdate(workInProgress), null !== nextResource ? (bubbleProperties(workInProgress), preloadResourceAndSuspendIfNeeded(workInProgress, nextResource)) : (bubbleProperties(workInProgress), preloadInstanceAndSuspendIfNeeded(workInProgress, type, null, newProps, renderLanes))) : nextResource ? nextResource !== current.memoizedState ? (markUpdate(workInProgress), bubbleProperties(workInProgress), preloadResourceAndSuspendIfNeeded(workInProgress, nextResource)) : (bubbleProperties(workInProgress), workInProgress.flags &= -16777217) : (current = current.memoizedProps, current !== newProps && markUpdate(workInProgress), bubbleProperties(workInProgress), preloadInstanceAndSuspendIfNeeded(workInProgress, type, current, newProps, renderLanes));
				return null;
			case 27:
				popHostContext(workInProgress);
				renderLanes = rootInstanceStackCursor.current;
				type = workInProgress.type;
				if (null !== current && null != workInProgress.stateNode) current.memoizedProps !== newProps && markUpdate(workInProgress);
				else {
					if (!newProps) {
						if (null === workInProgress.stateNode) throw Error(formatProdErrorMessage(166));
						bubbleProperties(workInProgress);
						return null;
					}
					current = contextStackCursor.current;
					popHydrationState(workInProgress) ? prepareToHydrateHostInstance(workInProgress, current) : (current = resolveSingletonInstance(type, newProps, renderLanes), workInProgress.stateNode = current, markUpdate(workInProgress));
				}
				bubbleProperties(workInProgress);
				return null;
			case 5:
				popHostContext(workInProgress);
				type = workInProgress.type;
				if (null !== current && null != workInProgress.stateNode) current.memoizedProps !== newProps && markUpdate(workInProgress);
				else {
					if (!newProps) {
						if (null === workInProgress.stateNode) throw Error(formatProdErrorMessage(166));
						bubbleProperties(workInProgress);
						return null;
					}
					nextResource = contextStackCursor.current;
					if (popHydrationState(workInProgress)) prepareToHydrateHostInstance(workInProgress, nextResource);
					else {
						var ownerDocument = getOwnerDocumentFromRootContainer(rootInstanceStackCursor.current);
						switch (nextResource) {
							case 1:
								nextResource = ownerDocument.createElementNS("http://www.w3.org/2000/svg", type);
								break;
							case 2:
								nextResource = ownerDocument.createElementNS("http://www.w3.org/1998/Math/MathML", type);
								break;
							default: switch (type) {
								case "svg":
									nextResource = ownerDocument.createElementNS("http://www.w3.org/2000/svg", type);
									break;
								case "math":
									nextResource = ownerDocument.createElementNS("http://www.w3.org/1998/Math/MathML", type);
									break;
								case "script":
									nextResource = ownerDocument.createElement("div");
									nextResource.innerHTML = "<script><\/script>";
									nextResource = nextResource.removeChild(nextResource.firstChild);
									break;
								case "select":
									nextResource = "string" === typeof newProps.is ? ownerDocument.createElement("select", { is: newProps.is }) : ownerDocument.createElement("select");
									newProps.multiple ? nextResource.multiple = !0 : newProps.size && (nextResource.size = newProps.size);
									break;
								default: nextResource = "string" === typeof newProps.is ? ownerDocument.createElement(type, { is: newProps.is }) : ownerDocument.createElement(type);
							}
						}
						nextResource[internalInstanceKey] = workInProgress;
						nextResource[internalPropsKey] = newProps;
						a: for (ownerDocument = workInProgress.child; null !== ownerDocument;) {
							if (5 === ownerDocument.tag || 6 === ownerDocument.tag) nextResource.appendChild(ownerDocument.stateNode);
							else if (4 !== ownerDocument.tag && 27 !== ownerDocument.tag && null !== ownerDocument.child) {
								ownerDocument.child.return = ownerDocument;
								ownerDocument = ownerDocument.child;
								continue;
							}
							if (ownerDocument === workInProgress) break a;
							for (; null === ownerDocument.sibling;) {
								if (null === ownerDocument.return || ownerDocument.return === workInProgress) break a;
								ownerDocument = ownerDocument.return;
							}
							ownerDocument.sibling.return = ownerDocument.return;
							ownerDocument = ownerDocument.sibling;
						}
						workInProgress.stateNode = nextResource;
						a: switch (setInitialProperties(nextResource, type, newProps), type) {
							case "button":
							case "input":
							case "select":
							case "textarea":
								newProps = !!newProps.autoFocus;
								break a;
							case "img":
								newProps = !0;
								break a;
							default: newProps = !1;
						}
						newProps && markUpdate(workInProgress);
					}
				}
				bubbleProperties(workInProgress);
				preloadInstanceAndSuspendIfNeeded(workInProgress, workInProgress.type, null === current ? null : current.memoizedProps, workInProgress.pendingProps, renderLanes);
				return null;
			case 6:
				if (current && null != workInProgress.stateNode) current.memoizedProps !== newProps && markUpdate(workInProgress);
				else {
					if ("string" !== typeof newProps && null === workInProgress.stateNode) throw Error(formatProdErrorMessage(166));
					current = rootInstanceStackCursor.current;
					if (popHydrationState(workInProgress)) {
						current = workInProgress.stateNode;
						renderLanes = workInProgress.memoizedProps;
						newProps = null;
						type = hydrationParentFiber;
						if (null !== type) switch (type.tag) {
							case 27:
							case 5: newProps = type.memoizedProps;
						}
						current[internalInstanceKey] = workInProgress;
						current = current.nodeValue === renderLanes || null !== newProps && !0 === newProps.suppressHydrationWarning || checkForUnmatchedText(current.nodeValue, renderLanes) ? !0 : !1;
						current || throwOnHydrationMismatch(workInProgress, !0);
					} else current = getOwnerDocumentFromRootContainer(current).createTextNode(newProps), current[internalInstanceKey] = workInProgress, workInProgress.stateNode = current;
				}
				bubbleProperties(workInProgress);
				return null;
			case 31:
				renderLanes = workInProgress.memoizedState;
				if (null === current || null !== current.memoizedState) {
					newProps = popHydrationState(workInProgress);
					if (null !== renderLanes) {
						if (null === current) {
							if (!newProps) throw Error(formatProdErrorMessage(318));
							current = workInProgress.memoizedState;
							current = null !== current ? current.dehydrated : null;
							if (!current) throw Error(formatProdErrorMessage(557));
							current[internalInstanceKey] = workInProgress;
						} else resetHydrationState(), 0 === (workInProgress.flags & 128) && (workInProgress.memoizedState = null), workInProgress.flags |= 4;
						bubbleProperties(workInProgress);
						current = !1;
					} else renderLanes = upgradeHydrationErrorsToRecoverable(), null !== current && null !== current.memoizedState && (current.memoizedState.hydrationErrors = renderLanes), current = !0;
					if (!current) {
						if (workInProgress.flags & 256) return popSuspenseHandler(workInProgress), workInProgress;
						popSuspenseHandler(workInProgress);
						return null;
					}
					if (0 !== (workInProgress.flags & 128)) throw Error(formatProdErrorMessage(558));
				}
				bubbleProperties(workInProgress);
				return null;
			case 13:
				newProps = workInProgress.memoizedState;
				if (null === current || null !== current.memoizedState && null !== current.memoizedState.dehydrated) {
					type = popHydrationState(workInProgress);
					if (null !== newProps && null !== newProps.dehydrated) {
						if (null === current) {
							if (!type) throw Error(formatProdErrorMessage(318));
							type = workInProgress.memoizedState;
							type = null !== type ? type.dehydrated : null;
							if (!type) throw Error(formatProdErrorMessage(317));
							type[internalInstanceKey] = workInProgress;
						} else resetHydrationState(), 0 === (workInProgress.flags & 128) && (workInProgress.memoizedState = null), workInProgress.flags |= 4;
						bubbleProperties(workInProgress);
						type = !1;
					} else type = upgradeHydrationErrorsToRecoverable(), null !== current && null !== current.memoizedState && (current.memoizedState.hydrationErrors = type), type = !0;
					if (!type) {
						if (workInProgress.flags & 256) return popSuspenseHandler(workInProgress), workInProgress;
						popSuspenseHandler(workInProgress);
						return null;
					}
				}
				popSuspenseHandler(workInProgress);
				if (0 !== (workInProgress.flags & 128)) return workInProgress.lanes = renderLanes, workInProgress;
				renderLanes = null !== newProps;
				current = null !== current && null !== current.memoizedState;
				renderLanes && (newProps = workInProgress.child, type = null, null !== newProps.alternate && null !== newProps.alternate.memoizedState && null !== newProps.alternate.memoizedState.cachePool && (type = newProps.alternate.memoizedState.cachePool.pool), nextResource = null, null !== newProps.memoizedState && null !== newProps.memoizedState.cachePool && (nextResource = newProps.memoizedState.cachePool.pool), nextResource !== type && (newProps.flags |= 2048));
				renderLanes !== current && renderLanes && (workInProgress.child.flags |= 8192);
				scheduleRetryEffect(workInProgress, workInProgress.updateQueue);
				bubbleProperties(workInProgress);
				return null;
			case 4: return popHostContainer(), null === current && listenToAllSupportedEvents(workInProgress.stateNode.containerInfo), bubbleProperties(workInProgress), null;
			case 10: return popProvider(workInProgress.type), bubbleProperties(workInProgress), null;
			case 19:
				pop(suspenseStackCursor);
				newProps = workInProgress.memoizedState;
				if (null === newProps) return bubbleProperties(workInProgress), null;
				type = 0 !== (workInProgress.flags & 128);
				nextResource = newProps.rendering;
				if (null === nextResource) if (type) cutOffTailIfNeeded(newProps, !1);
				else {
					if (0 !== workInProgressRootExitStatus || null !== current && 0 !== (current.flags & 128)) for (current = workInProgress.child; null !== current;) {
						nextResource = findFirstSuspended(current);
						if (null !== nextResource) {
							workInProgress.flags |= 128;
							cutOffTailIfNeeded(newProps, !1);
							current = nextResource.updateQueue;
							workInProgress.updateQueue = current;
							scheduleRetryEffect(workInProgress, current);
							workInProgress.subtreeFlags = 0;
							current = renderLanes;
							for (renderLanes = workInProgress.child; null !== renderLanes;) resetWorkInProgress(renderLanes, current), renderLanes = renderLanes.sibling;
							push(suspenseStackCursor, suspenseStackCursor.current & 1 | 2);
							isHydrating && pushTreeFork(workInProgress, newProps.treeForkCount);
							return workInProgress.child;
						}
						current = current.sibling;
					}
					null !== newProps.tail && now() > workInProgressRootRenderTargetTime && (workInProgress.flags |= 128, type = !0, cutOffTailIfNeeded(newProps, !1), workInProgress.lanes = 4194304);
				}
				else {
					if (!type) if (current = findFirstSuspended(nextResource), null !== current) {
						if (workInProgress.flags |= 128, type = !0, current = current.updateQueue, workInProgress.updateQueue = current, scheduleRetryEffect(workInProgress, current), cutOffTailIfNeeded(newProps, !0), null === newProps.tail && "hidden" === newProps.tailMode && !nextResource.alternate && !isHydrating) return bubbleProperties(workInProgress), null;
					} else 2 * now() - newProps.renderingStartTime > workInProgressRootRenderTargetTime && 536870912 !== renderLanes && (workInProgress.flags |= 128, type = !0, cutOffTailIfNeeded(newProps, !1), workInProgress.lanes = 4194304);
					newProps.isBackwards ? (nextResource.sibling = workInProgress.child, workInProgress.child = nextResource) : (current = newProps.last, null !== current ? current.sibling = nextResource : workInProgress.child = nextResource, newProps.last = nextResource);
				}
				if (null !== newProps.tail) return current = newProps.tail, newProps.rendering = current, newProps.tail = current.sibling, newProps.renderingStartTime = now(), current.sibling = null, renderLanes = suspenseStackCursor.current, push(suspenseStackCursor, type ? renderLanes & 1 | 2 : renderLanes & 1), isHydrating && pushTreeFork(workInProgress, newProps.treeForkCount), current;
				bubbleProperties(workInProgress);
				return null;
			case 22:
			case 23: return popSuspenseHandler(workInProgress), popHiddenContext(), newProps = null !== workInProgress.memoizedState, null !== current ? null !== current.memoizedState !== newProps && (workInProgress.flags |= 8192) : newProps && (workInProgress.flags |= 8192), newProps ? 0 !== (renderLanes & 536870912) && 0 === (workInProgress.flags & 128) && (bubbleProperties(workInProgress), workInProgress.subtreeFlags & 6 && (workInProgress.flags |= 8192)) : bubbleProperties(workInProgress), renderLanes = workInProgress.updateQueue, null !== renderLanes && scheduleRetryEffect(workInProgress, renderLanes.retryQueue), renderLanes = null, null !== current && null !== current.memoizedState && null !== current.memoizedState.cachePool && (renderLanes = current.memoizedState.cachePool.pool), newProps = null, null !== workInProgress.memoizedState && null !== workInProgress.memoizedState.cachePool && (newProps = workInProgress.memoizedState.cachePool.pool), newProps !== renderLanes && (workInProgress.flags |= 2048), null !== current && pop(resumedCache), null;
			case 24: return renderLanes = null, null !== current && (renderLanes = current.memoizedState.cache), workInProgress.memoizedState.cache !== renderLanes && (workInProgress.flags |= 2048), popProvider(CacheContext), bubbleProperties(workInProgress), null;
			case 25: return null;
			case 30: return null;
		}
		throw Error(formatProdErrorMessage(156, workInProgress.tag));
	}
	function unwindWork(current, workInProgress) {
		popTreeContext(workInProgress);
		switch (workInProgress.tag) {
			case 1: return current = workInProgress.flags, current & 65536 ? (workInProgress.flags = current & -65537 | 128, workInProgress) : null;
			case 3: return popProvider(CacheContext), popHostContainer(), current = workInProgress.flags, 0 !== (current & 65536) && 0 === (current & 128) ? (workInProgress.flags = current & -65537 | 128, workInProgress) : null;
			case 26:
			case 27:
			case 5: return popHostContext(workInProgress), null;
			case 31:
				if (null !== workInProgress.memoizedState) {
					popSuspenseHandler(workInProgress);
					if (null === workInProgress.alternate) throw Error(formatProdErrorMessage(340));
					resetHydrationState();
				}
				current = workInProgress.flags;
				return current & 65536 ? (workInProgress.flags = current & -65537 | 128, workInProgress) : null;
			case 13:
				popSuspenseHandler(workInProgress);
				current = workInProgress.memoizedState;
				if (null !== current && null !== current.dehydrated) {
					if (null === workInProgress.alternate) throw Error(formatProdErrorMessage(340));
					resetHydrationState();
				}
				current = workInProgress.flags;
				return current & 65536 ? (workInProgress.flags = current & -65537 | 128, workInProgress) : null;
			case 19: return pop(suspenseStackCursor), null;
			case 4: return popHostContainer(), null;
			case 10: return popProvider(workInProgress.type), null;
			case 22:
			case 23: return popSuspenseHandler(workInProgress), popHiddenContext(), null !== current && pop(resumedCache), current = workInProgress.flags, current & 65536 ? (workInProgress.flags = current & -65537 | 128, workInProgress) : null;
			case 24: return popProvider(CacheContext), null;
			case 25: return null;
			default: return null;
		}
	}
	function unwindInterruptedWork(current, interruptedWork) {
		popTreeContext(interruptedWork);
		switch (interruptedWork.tag) {
			case 3:
				popProvider(CacheContext);
				popHostContainer();
				break;
			case 26:
			case 27:
			case 5:
				popHostContext(interruptedWork);
				break;
			case 4:
				popHostContainer();
				break;
			case 31:
				null !== interruptedWork.memoizedState && popSuspenseHandler(interruptedWork);
				break;
			case 13:
				popSuspenseHandler(interruptedWork);
				break;
			case 19:
				pop(suspenseStackCursor);
				break;
			case 10:
				popProvider(interruptedWork.type);
				break;
			case 22:
			case 23:
				popSuspenseHandler(interruptedWork);
				popHiddenContext();
				null !== current && pop(resumedCache);
				break;
			case 24: popProvider(CacheContext);
		}
	}
	function commitHookEffectListMount(flags, finishedWork) {
		try {
			var updateQueue = finishedWork.updateQueue, lastEffect = null !== updateQueue ? updateQueue.lastEffect : null;
			if (null !== lastEffect) {
				var firstEffect = lastEffect.next;
				updateQueue = firstEffect;
				do {
					if ((updateQueue.tag & flags) === flags) {
						lastEffect = void 0;
						var create = updateQueue.create, inst = updateQueue.inst;
						lastEffect = create();
						inst.destroy = lastEffect;
					}
					updateQueue = updateQueue.next;
				} while (updateQueue !== firstEffect);
			}
		} catch (error) {
			captureCommitPhaseError(finishedWork, finishedWork.return, error);
		}
	}
	function commitHookEffectListUnmount(flags, finishedWork, nearestMountedAncestor$jscomp$0) {
		try {
			var updateQueue = finishedWork.updateQueue, lastEffect = null !== updateQueue ? updateQueue.lastEffect : null;
			if (null !== lastEffect) {
				var firstEffect = lastEffect.next;
				updateQueue = firstEffect;
				do {
					if ((updateQueue.tag & flags) === flags) {
						var inst = updateQueue.inst, destroy = inst.destroy;
						if (void 0 !== destroy) {
							inst.destroy = void 0;
							lastEffect = finishedWork;
							var nearestMountedAncestor = nearestMountedAncestor$jscomp$0, destroy_ = destroy;
							try {
								destroy_();
							} catch (error) {
								captureCommitPhaseError(lastEffect, nearestMountedAncestor, error);
							}
						}
					}
					updateQueue = updateQueue.next;
				} while (updateQueue !== firstEffect);
			}
		} catch (error) {
			captureCommitPhaseError(finishedWork, finishedWork.return, error);
		}
	}
	function commitClassCallbacks(finishedWork) {
		var updateQueue = finishedWork.updateQueue;
		if (null !== updateQueue) {
			var instance = finishedWork.stateNode;
			try {
				commitCallbacks(updateQueue, instance);
			} catch (error) {
				captureCommitPhaseError(finishedWork, finishedWork.return, error);
			}
		}
	}
	function safelyCallComponentWillUnmount(current, nearestMountedAncestor, instance) {
		instance.props = resolveClassComponentProps(current.type, current.memoizedProps);
		instance.state = current.memoizedState;
		try {
			instance.componentWillUnmount();
		} catch (error) {
			captureCommitPhaseError(current, nearestMountedAncestor, error);
		}
	}
	function safelyAttachRef(current, nearestMountedAncestor) {
		try {
			var ref = current.ref;
			if (null !== ref) {
				switch (current.tag) {
					case 26:
					case 27:
					case 5:
						var instanceToUse = current.stateNode;
						break;
					case 30:
						instanceToUse = current.stateNode;
						break;
					default: instanceToUse = current.stateNode;
				}
				"function" === typeof ref ? current.refCleanup = ref(instanceToUse) : ref.current = instanceToUse;
			}
		} catch (error) {
			captureCommitPhaseError(current, nearestMountedAncestor, error);
		}
	}
	function safelyDetachRef(current, nearestMountedAncestor) {
		var ref = current.ref, refCleanup = current.refCleanup;
		if (null !== ref) if ("function" === typeof refCleanup) try {
			refCleanup();
		} catch (error) {
			captureCommitPhaseError(current, nearestMountedAncestor, error);
		} finally {
			current.refCleanup = null, current = current.alternate, null != current && (current.refCleanup = null);
		}
		else if ("function" === typeof ref) try {
			ref(null);
		} catch (error$140) {
			captureCommitPhaseError(current, nearestMountedAncestor, error$140);
		}
		else ref.current = null;
	}
	function commitHostMount(finishedWork) {
		var type = finishedWork.type, props = finishedWork.memoizedProps, instance = finishedWork.stateNode;
		try {
			a: switch (type) {
				case "button":
				case "input":
				case "select":
				case "textarea":
					props.autoFocus && instance.focus();
					break a;
				case "img": props.src ? instance.src = props.src : props.srcSet && (instance.srcset = props.srcSet);
			}
		} catch (error) {
			captureCommitPhaseError(finishedWork, finishedWork.return, error);
		}
	}
	function commitHostUpdate(finishedWork, newProps, oldProps) {
		try {
			var domElement = finishedWork.stateNode;
			updateProperties(domElement, finishedWork.type, oldProps, newProps);
			domElement[internalPropsKey] = newProps;
		} catch (error) {
			captureCommitPhaseError(finishedWork, finishedWork.return, error);
		}
	}
	function isHostParent(fiber) {
		return 5 === fiber.tag || 3 === fiber.tag || 26 === fiber.tag || 27 === fiber.tag && isSingletonScope(fiber.type) || 4 === fiber.tag;
	}
	function getHostSibling(fiber) {
		a: for (;;) {
			for (; null === fiber.sibling;) {
				if (null === fiber.return || isHostParent(fiber.return)) return null;
				fiber = fiber.return;
			}
			fiber.sibling.return = fiber.return;
			for (fiber = fiber.sibling; 5 !== fiber.tag && 6 !== fiber.tag && 18 !== fiber.tag;) {
				if (27 === fiber.tag && isSingletonScope(fiber.type)) continue a;
				if (fiber.flags & 2) continue a;
				if (null === fiber.child || 4 === fiber.tag) continue a;
				else fiber.child.return = fiber, fiber = fiber.child;
			}
			if (!(fiber.flags & 2)) return fiber.stateNode;
		}
	}
	function insertOrAppendPlacementNodeIntoContainer(node, before, parent) {
		var tag = node.tag;
		if (5 === tag || 6 === tag) node = node.stateNode, before ? (9 === parent.nodeType ? parent.body : "HTML" === parent.nodeName ? parent.ownerDocument.body : parent).insertBefore(node, before) : (before = 9 === parent.nodeType ? parent.body : "HTML" === parent.nodeName ? parent.ownerDocument.body : parent, before.appendChild(node), parent = parent._reactRootContainer, null !== parent && void 0 !== parent || null !== before.onclick || (before.onclick = noop$1));
		else if (4 !== tag && (27 === tag && isSingletonScope(node.type) && (parent = node.stateNode, before = null), node = node.child, null !== node)) for (insertOrAppendPlacementNodeIntoContainer(node, before, parent), node = node.sibling; null !== node;) insertOrAppendPlacementNodeIntoContainer(node, before, parent), node = node.sibling;
	}
	function insertOrAppendPlacementNode(node, before, parent) {
		var tag = node.tag;
		if (5 === tag || 6 === tag) node = node.stateNode, before ? parent.insertBefore(node, before) : parent.appendChild(node);
		else if (4 !== tag && (27 === tag && isSingletonScope(node.type) && (parent = node.stateNode), node = node.child, null !== node)) for (insertOrAppendPlacementNode(node, before, parent), node = node.sibling; null !== node;) insertOrAppendPlacementNode(node, before, parent), node = node.sibling;
	}
	function commitHostSingletonAcquisition(finishedWork) {
		var singleton = finishedWork.stateNode, props = finishedWork.memoizedProps;
		try {
			for (var type = finishedWork.type, attributes = singleton.attributes; attributes.length;) singleton.removeAttributeNode(attributes[0]);
			setInitialProperties(singleton, type, props);
			singleton[internalInstanceKey] = finishedWork;
			singleton[internalPropsKey] = props;
		} catch (error) {
			captureCommitPhaseError(finishedWork, finishedWork.return, error);
		}
	}
	var offscreenSubtreeIsHidden = !1, offscreenSubtreeWasHidden = !1, needsFormReset = !1, PossiblyWeakSet = "function" === typeof WeakSet ? WeakSet : Set, nextEffect = null;
	function commitBeforeMutationEffects(root, firstChild) {
		root = root.containerInfo;
		eventsEnabled = _enabled;
		root = getActiveElementDeep(root);
		if (hasSelectionCapabilities(root)) {
			if ("selectionStart" in root) var JSCompiler_temp = {
				start: root.selectionStart,
				end: root.selectionEnd
			};
			else a: {
				JSCompiler_temp = (JSCompiler_temp = root.ownerDocument) && JSCompiler_temp.defaultView || window;
				var selection = JSCompiler_temp.getSelection && JSCompiler_temp.getSelection();
				if (selection && 0 !== selection.rangeCount) {
					JSCompiler_temp = selection.anchorNode;
					var anchorOffset = selection.anchorOffset, focusNode = selection.focusNode;
					selection = selection.focusOffset;
					try {
						JSCompiler_temp.nodeType, focusNode.nodeType;
					} catch (e$20) {
						JSCompiler_temp = null;
						break a;
					}
					var length = 0, start = -1, end = -1, indexWithinAnchor = 0, indexWithinFocus = 0, node = root, parentNode = null;
					b: for (;;) {
						for (var next;;) {
							node !== JSCompiler_temp || 0 !== anchorOffset && 3 !== node.nodeType || (start = length + anchorOffset);
							node !== focusNode || 0 !== selection && 3 !== node.nodeType || (end = length + selection);
							3 === node.nodeType && (length += node.nodeValue.length);
							if (null === (next = node.firstChild)) break;
							parentNode = node;
							node = next;
						}
						for (;;) {
							if (node === root) break b;
							parentNode === JSCompiler_temp && ++indexWithinAnchor === anchorOffset && (start = length);
							parentNode === focusNode && ++indexWithinFocus === selection && (end = length);
							if (null !== (next = node.nextSibling)) break;
							node = parentNode;
							parentNode = node.parentNode;
						}
						node = next;
					}
					JSCompiler_temp = -1 === start || -1 === end ? null : {
						start,
						end
					};
				} else JSCompiler_temp = null;
			}
			JSCompiler_temp = JSCompiler_temp || {
				start: 0,
				end: 0
			};
		} else JSCompiler_temp = null;
		selectionInformation = {
			focusedElem: root,
			selectionRange: JSCompiler_temp
		};
		_enabled = !1;
		for (nextEffect = firstChild; null !== nextEffect;) if (firstChild = nextEffect, root = firstChild.child, 0 !== (firstChild.subtreeFlags & 1028) && null !== root) root.return = firstChild, nextEffect = root;
		else for (; null !== nextEffect;) {
			firstChild = nextEffect;
			focusNode = firstChild.alternate;
			root = firstChild.flags;
			switch (firstChild.tag) {
				case 0:
					if (0 !== (root & 4) && (root = firstChild.updateQueue, root = null !== root ? root.events : null, null !== root)) for (JSCompiler_temp = 0; JSCompiler_temp < root.length; JSCompiler_temp++) anchorOffset = root[JSCompiler_temp], anchorOffset.ref.impl = anchorOffset.nextImpl;
					break;
				case 11:
				case 15: break;
				case 1:
					if (0 !== (root & 1024) && null !== focusNode) {
						root = void 0;
						JSCompiler_temp = firstChild;
						anchorOffset = focusNode.memoizedProps;
						focusNode = focusNode.memoizedState;
						selection = JSCompiler_temp.stateNode;
						try {
							var resolvedPrevProps = resolveClassComponentProps(JSCompiler_temp.type, anchorOffset);
							root = selection.getSnapshotBeforeUpdate(resolvedPrevProps, focusNode);
							selection.__reactInternalSnapshotBeforeUpdate = root;
						} catch (error) {
							captureCommitPhaseError(JSCompiler_temp, JSCompiler_temp.return, error);
						}
					}
					break;
				case 3:
					if (0 !== (root & 1024)) {
						if (root = firstChild.stateNode.containerInfo, JSCompiler_temp = root.nodeType, 9 === JSCompiler_temp) clearContainerSparingly(root);
						else if (1 === JSCompiler_temp) switch (root.nodeName) {
							case "HEAD":
							case "HTML":
							case "BODY":
								clearContainerSparingly(root);
								break;
							default: root.textContent = "";
						}
					}
					break;
				case 5:
				case 26:
				case 27:
				case 6:
				case 4:
				case 17: break;
				default: if (0 !== (root & 1024)) throw Error(formatProdErrorMessage(163));
			}
			root = firstChild.sibling;
			if (null !== root) {
				root.return = firstChild.return;
				nextEffect = root;
				break;
			}
			nextEffect = firstChild.return;
		}
	}
	function commitLayoutEffectOnFiber(finishedRoot, current, finishedWork) {
		var flags = finishedWork.flags;
		switch (finishedWork.tag) {
			case 0:
			case 11:
			case 15:
				recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
				flags & 4 && commitHookEffectListMount(5, finishedWork);
				break;
			case 1:
				recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
				if (flags & 4) if (finishedRoot = finishedWork.stateNode, null === current) try {
					finishedRoot.componentDidMount();
				} catch (error) {
					captureCommitPhaseError(finishedWork, finishedWork.return, error);
				}
				else {
					var prevProps = resolveClassComponentProps(finishedWork.type, current.memoizedProps);
					current = current.memoizedState;
					try {
						finishedRoot.componentDidUpdate(prevProps, current, finishedRoot.__reactInternalSnapshotBeforeUpdate);
					} catch (error$139) {
						captureCommitPhaseError(finishedWork, finishedWork.return, error$139);
					}
				}
				flags & 64 && commitClassCallbacks(finishedWork);
				flags & 512 && safelyAttachRef(finishedWork, finishedWork.return);
				break;
			case 3:
				recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
				if (flags & 64 && (finishedRoot = finishedWork.updateQueue, null !== finishedRoot)) {
					current = null;
					if (null !== finishedWork.child) switch (finishedWork.child.tag) {
						case 27:
						case 5:
							current = finishedWork.child.stateNode;
							break;
						case 1: current = finishedWork.child.stateNode;
					}
					try {
						commitCallbacks(finishedRoot, current);
					} catch (error) {
						captureCommitPhaseError(finishedWork, finishedWork.return, error);
					}
				}
				break;
			case 27: null === current && flags & 4 && commitHostSingletonAcquisition(finishedWork);
			case 26:
			case 5:
				recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
				null === current && flags & 4 && commitHostMount(finishedWork);
				flags & 512 && safelyAttachRef(finishedWork, finishedWork.return);
				break;
			case 12:
				recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
				break;
			case 31:
				recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
				flags & 4 && commitActivityHydrationCallbacks(finishedRoot, finishedWork);
				break;
			case 13:
				recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
				flags & 4 && commitSuspenseHydrationCallbacks(finishedRoot, finishedWork);
				flags & 64 && (finishedRoot = finishedWork.memoizedState, null !== finishedRoot && (finishedRoot = finishedRoot.dehydrated, null !== finishedRoot && (finishedWork = retryDehydratedSuspenseBoundary.bind(null, finishedWork), registerSuspenseInstanceRetry(finishedRoot, finishedWork))));
				break;
			case 22:
				flags = null !== finishedWork.memoizedState || offscreenSubtreeIsHidden;
				if (!flags) {
					current = null !== current && null !== current.memoizedState || offscreenSubtreeWasHidden;
					prevProps = offscreenSubtreeIsHidden;
					var prevOffscreenSubtreeWasHidden = offscreenSubtreeWasHidden;
					offscreenSubtreeIsHidden = flags;
					(offscreenSubtreeWasHidden = current) && !prevOffscreenSubtreeWasHidden ? recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, 0 !== (finishedWork.subtreeFlags & 8772)) : recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
					offscreenSubtreeIsHidden = prevProps;
					offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden;
				}
				break;
			case 30: break;
			default: recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
		}
	}
	function detachFiberAfterEffects(fiber) {
		var alternate = fiber.alternate;
		null !== alternate && (fiber.alternate = null, detachFiberAfterEffects(alternate));
		fiber.child = null;
		fiber.deletions = null;
		fiber.sibling = null;
		5 === fiber.tag && (alternate = fiber.stateNode, null !== alternate && detachDeletedInstance(alternate));
		fiber.stateNode = null;
		fiber.return = null;
		fiber.dependencies = null;
		fiber.memoizedProps = null;
		fiber.memoizedState = null;
		fiber.pendingProps = null;
		fiber.stateNode = null;
		fiber.updateQueue = null;
	}
	var hostParent = null, hostParentIsContainer = !1;
	function recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, parent) {
		for (parent = parent.child; null !== parent;) commitDeletionEffectsOnFiber(finishedRoot, nearestMountedAncestor, parent), parent = parent.sibling;
	}
	function commitDeletionEffectsOnFiber(finishedRoot, nearestMountedAncestor, deletedFiber) {
		if (injectedHook && "function" === typeof injectedHook.onCommitFiberUnmount) try {
			injectedHook.onCommitFiberUnmount(rendererID, deletedFiber);
		} catch (err) {}
		switch (deletedFiber.tag) {
			case 26:
				offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				deletedFiber.memoizedState ? deletedFiber.memoizedState.count-- : deletedFiber.stateNode && (deletedFiber = deletedFiber.stateNode, deletedFiber.parentNode.removeChild(deletedFiber));
				break;
			case 27:
				offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
				var prevHostParent = hostParent, prevHostParentIsContainer = hostParentIsContainer;
				isSingletonScope(deletedFiber.type) && (hostParent = deletedFiber.stateNode, hostParentIsContainer = !1);
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				releaseSingletonInstance(deletedFiber.stateNode);
				hostParent = prevHostParent;
				hostParentIsContainer = prevHostParentIsContainer;
				break;
			case 5: offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
			case 6:
				prevHostParent = hostParent;
				prevHostParentIsContainer = hostParentIsContainer;
				hostParent = null;
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				hostParent = prevHostParent;
				hostParentIsContainer = prevHostParentIsContainer;
				if (null !== hostParent) if (hostParentIsContainer) try {
					(9 === hostParent.nodeType ? hostParent.body : "HTML" === hostParent.nodeName ? hostParent.ownerDocument.body : hostParent).removeChild(deletedFiber.stateNode);
				} catch (error) {
					captureCommitPhaseError(deletedFiber, nearestMountedAncestor, error);
				}
				else try {
					hostParent.removeChild(deletedFiber.stateNode);
				} catch (error) {
					captureCommitPhaseError(deletedFiber, nearestMountedAncestor, error);
				}
				break;
			case 18:
				null !== hostParent && (hostParentIsContainer ? (finishedRoot = hostParent, clearHydrationBoundary(9 === finishedRoot.nodeType ? finishedRoot.body : "HTML" === finishedRoot.nodeName ? finishedRoot.ownerDocument.body : finishedRoot, deletedFiber.stateNode), retryIfBlockedOn(finishedRoot)) : clearHydrationBoundary(hostParent, deletedFiber.stateNode));
				break;
			case 4:
				prevHostParent = hostParent;
				prevHostParentIsContainer = hostParentIsContainer;
				hostParent = deletedFiber.stateNode.containerInfo;
				hostParentIsContainer = !0;
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				hostParent = prevHostParent;
				hostParentIsContainer = prevHostParentIsContainer;
				break;
			case 0:
			case 11:
			case 14:
			case 15:
				commitHookEffectListUnmount(2, deletedFiber, nearestMountedAncestor);
				offscreenSubtreeWasHidden || commitHookEffectListUnmount(4, deletedFiber, nearestMountedAncestor);
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				break;
			case 1:
				offscreenSubtreeWasHidden || (safelyDetachRef(deletedFiber, nearestMountedAncestor), prevHostParent = deletedFiber.stateNode, "function" === typeof prevHostParent.componentWillUnmount && safelyCallComponentWillUnmount(deletedFiber, nearestMountedAncestor, prevHostParent));
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				break;
			case 21:
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				break;
			case 22:
				offscreenSubtreeWasHidden = (prevHostParent = offscreenSubtreeWasHidden) || null !== deletedFiber.memoizedState;
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				offscreenSubtreeWasHidden = prevHostParent;
				break;
			default: recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
		}
	}
	function commitActivityHydrationCallbacks(finishedRoot, finishedWork) {
		if (null === finishedWork.memoizedState && (finishedRoot = finishedWork.alternate, null !== finishedRoot && (finishedRoot = finishedRoot.memoizedState, null !== finishedRoot))) {
			finishedRoot = finishedRoot.dehydrated;
			try {
				retryIfBlockedOn(finishedRoot);
			} catch (error) {
				captureCommitPhaseError(finishedWork, finishedWork.return, error);
			}
		}
	}
	function commitSuspenseHydrationCallbacks(finishedRoot, finishedWork) {
		if (null === finishedWork.memoizedState && (finishedRoot = finishedWork.alternate, null !== finishedRoot && (finishedRoot = finishedRoot.memoizedState, null !== finishedRoot && (finishedRoot = finishedRoot.dehydrated, null !== finishedRoot)))) try {
			retryIfBlockedOn(finishedRoot);
		} catch (error) {
			captureCommitPhaseError(finishedWork, finishedWork.return, error);
		}
	}
	function getRetryCache(finishedWork) {
		switch (finishedWork.tag) {
			case 31:
			case 13:
			case 19:
				var retryCache = finishedWork.stateNode;
				null === retryCache && (retryCache = finishedWork.stateNode = new PossiblyWeakSet());
				return retryCache;
			case 22: return finishedWork = finishedWork.stateNode, retryCache = finishedWork._retryCache, null === retryCache && (retryCache = finishedWork._retryCache = new PossiblyWeakSet()), retryCache;
			default: throw Error(formatProdErrorMessage(435, finishedWork.tag));
		}
	}
	function attachSuspenseRetryListeners(finishedWork, wakeables) {
		var retryCache = getRetryCache(finishedWork);
		wakeables.forEach(function(wakeable) {
			if (!retryCache.has(wakeable)) {
				retryCache.add(wakeable);
				var retry = resolveRetryWakeable.bind(null, finishedWork, wakeable);
				wakeable.then(retry, retry);
			}
		});
	}
	function recursivelyTraverseMutationEffects(root$jscomp$0, parentFiber) {
		var deletions = parentFiber.deletions;
		if (null !== deletions) for (var i = 0; i < deletions.length; i++) {
			var childToDelete = deletions[i], root = root$jscomp$0, returnFiber = parentFiber, parent = returnFiber;
			a: for (; null !== parent;) {
				switch (parent.tag) {
					case 27:
						if (isSingletonScope(parent.type)) {
							hostParent = parent.stateNode;
							hostParentIsContainer = !1;
							break a;
						}
						break;
					case 5:
						hostParent = parent.stateNode;
						hostParentIsContainer = !1;
						break a;
					case 3:
					case 4:
						hostParent = parent.stateNode.containerInfo;
						hostParentIsContainer = !0;
						break a;
				}
				parent = parent.return;
			}
			if (null === hostParent) throw Error(formatProdErrorMessage(160));
			commitDeletionEffectsOnFiber(root, returnFiber, childToDelete);
			hostParent = null;
			hostParentIsContainer = !1;
			root = childToDelete.alternate;
			null !== root && (root.return = null);
			childToDelete.return = null;
		}
		if (parentFiber.subtreeFlags & 13886) for (parentFiber = parentFiber.child; null !== parentFiber;) commitMutationEffectsOnFiber(parentFiber, root$jscomp$0), parentFiber = parentFiber.sibling;
	}
	var currentHoistableRoot = null;
	function commitMutationEffectsOnFiber(finishedWork, root) {
		var current = finishedWork.alternate, flags = finishedWork.flags;
		switch (finishedWork.tag) {
			case 0:
			case 11:
			case 14:
			case 15:
				recursivelyTraverseMutationEffects(root, finishedWork);
				commitReconciliationEffects(finishedWork);
				flags & 4 && (commitHookEffectListUnmount(3, finishedWork, finishedWork.return), commitHookEffectListMount(3, finishedWork), commitHookEffectListUnmount(5, finishedWork, finishedWork.return));
				break;
			case 1:
				recursivelyTraverseMutationEffects(root, finishedWork);
				commitReconciliationEffects(finishedWork);
				flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
				flags & 64 && offscreenSubtreeIsHidden && (finishedWork = finishedWork.updateQueue, null !== finishedWork && (flags = finishedWork.callbacks, null !== flags && (current = finishedWork.shared.hiddenCallbacks, finishedWork.shared.hiddenCallbacks = null === current ? flags : current.concat(flags))));
				break;
			case 26:
				var hoistableRoot = currentHoistableRoot;
				recursivelyTraverseMutationEffects(root, finishedWork);
				commitReconciliationEffects(finishedWork);
				flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
				if (flags & 4) {
					var currentResource = null !== current ? current.memoizedState : null;
					flags = finishedWork.memoizedState;
					if (null === current) if (null === flags) if (null === finishedWork.stateNode) {
						a: {
							flags = finishedWork.type;
							current = finishedWork.memoizedProps;
							hoistableRoot = hoistableRoot.ownerDocument || hoistableRoot;
							b: switch (flags) {
								case "title":
									currentResource = hoistableRoot.getElementsByTagName("title")[0];
									if (!currentResource || currentResource[internalHoistableMarker] || currentResource[internalInstanceKey] || "http://www.w3.org/2000/svg" === currentResource.namespaceURI || currentResource.hasAttribute("itemprop")) currentResource = hoistableRoot.createElement(flags), hoistableRoot.head.insertBefore(currentResource, hoistableRoot.querySelector("head > title"));
									setInitialProperties(currentResource, flags, current);
									currentResource[internalInstanceKey] = finishedWork;
									markNodeAsHoistable(currentResource);
									flags = currentResource;
									break a;
								case "link":
									var maybeNodes = getHydratableHoistableCache("link", "href", hoistableRoot).get(flags + (current.href || ""));
									if (maybeNodes) {
										for (var i = 0; i < maybeNodes.length; i++) if (currentResource = maybeNodes[i], currentResource.getAttribute("href") === (null == current.href || "" === current.href ? null : current.href) && currentResource.getAttribute("rel") === (null == current.rel ? null : current.rel) && currentResource.getAttribute("title") === (null == current.title ? null : current.title) && currentResource.getAttribute("crossorigin") === (null == current.crossOrigin ? null : current.crossOrigin)) {
											maybeNodes.splice(i, 1);
											break b;
										}
									}
									currentResource = hoistableRoot.createElement(flags);
									setInitialProperties(currentResource, flags, current);
									hoistableRoot.head.appendChild(currentResource);
									break;
								case "meta":
									if (maybeNodes = getHydratableHoistableCache("meta", "content", hoistableRoot).get(flags + (current.content || ""))) {
										for (i = 0; i < maybeNodes.length; i++) if (currentResource = maybeNodes[i], currentResource.getAttribute("content") === (null == current.content ? null : "" + current.content) && currentResource.getAttribute("name") === (null == current.name ? null : current.name) && currentResource.getAttribute("property") === (null == current.property ? null : current.property) && currentResource.getAttribute("http-equiv") === (null == current.httpEquiv ? null : current.httpEquiv) && currentResource.getAttribute("charset") === (null == current.charSet ? null : current.charSet)) {
											maybeNodes.splice(i, 1);
											break b;
										}
									}
									currentResource = hoistableRoot.createElement(flags);
									setInitialProperties(currentResource, flags, current);
									hoistableRoot.head.appendChild(currentResource);
									break;
								default: throw Error(formatProdErrorMessage(468, flags));
							}
							currentResource[internalInstanceKey] = finishedWork;
							markNodeAsHoistable(currentResource);
							flags = currentResource;
						}
						finishedWork.stateNode = flags;
					} else mountHoistable(hoistableRoot, finishedWork.type, finishedWork.stateNode);
					else finishedWork.stateNode = acquireResource(hoistableRoot, flags, finishedWork.memoizedProps);
					else currentResource !== flags ? (null === currentResource ? null !== current.stateNode && (current = current.stateNode, current.parentNode.removeChild(current)) : currentResource.count--, null === flags ? mountHoistable(hoistableRoot, finishedWork.type, finishedWork.stateNode) : acquireResource(hoistableRoot, flags, finishedWork.memoizedProps)) : null === flags && null !== finishedWork.stateNode && commitHostUpdate(finishedWork, finishedWork.memoizedProps, current.memoizedProps);
				}
				break;
			case 27:
				recursivelyTraverseMutationEffects(root, finishedWork);
				commitReconciliationEffects(finishedWork);
				flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
				null !== current && flags & 4 && commitHostUpdate(finishedWork, finishedWork.memoizedProps, current.memoizedProps);
				break;
			case 5:
				recursivelyTraverseMutationEffects(root, finishedWork);
				commitReconciliationEffects(finishedWork);
				flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
				if (finishedWork.flags & 32) {
					hoistableRoot = finishedWork.stateNode;
					try {
						setTextContent(hoistableRoot, "");
					} catch (error) {
						captureCommitPhaseError(finishedWork, finishedWork.return, error);
					}
				}
				flags & 4 && null != finishedWork.stateNode && (hoistableRoot = finishedWork.memoizedProps, commitHostUpdate(finishedWork, hoistableRoot, null !== current ? current.memoizedProps : hoistableRoot));
				flags & 1024 && (needsFormReset = !0);
				break;
			case 6:
				recursivelyTraverseMutationEffects(root, finishedWork);
				commitReconciliationEffects(finishedWork);
				if (flags & 4) {
					if (null === finishedWork.stateNode) throw Error(formatProdErrorMessage(162));
					flags = finishedWork.memoizedProps;
					current = finishedWork.stateNode;
					try {
						current.nodeValue = flags;
					} catch (error) {
						captureCommitPhaseError(finishedWork, finishedWork.return, error);
					}
				}
				break;
			case 3:
				tagCaches = null;
				hoistableRoot = currentHoistableRoot;
				currentHoistableRoot = getHoistableRoot(root.containerInfo);
				recursivelyTraverseMutationEffects(root, finishedWork);
				currentHoistableRoot = hoistableRoot;
				commitReconciliationEffects(finishedWork);
				if (flags & 4 && null !== current && current.memoizedState.isDehydrated) try {
					retryIfBlockedOn(root.containerInfo);
				} catch (error) {
					captureCommitPhaseError(finishedWork, finishedWork.return, error);
				}
				needsFormReset && (needsFormReset = !1, recursivelyResetForms(finishedWork));
				break;
			case 4:
				flags = currentHoistableRoot;
				currentHoistableRoot = getHoistableRoot(finishedWork.stateNode.containerInfo);
				recursivelyTraverseMutationEffects(root, finishedWork);
				commitReconciliationEffects(finishedWork);
				currentHoistableRoot = flags;
				break;
			case 12:
				recursivelyTraverseMutationEffects(root, finishedWork);
				commitReconciliationEffects(finishedWork);
				break;
			case 31:
				recursivelyTraverseMutationEffects(root, finishedWork);
				commitReconciliationEffects(finishedWork);
				flags & 4 && (flags = finishedWork.updateQueue, null !== flags && (finishedWork.updateQueue = null, attachSuspenseRetryListeners(finishedWork, flags)));
				break;
			case 13:
				recursivelyTraverseMutationEffects(root, finishedWork);
				commitReconciliationEffects(finishedWork);
				finishedWork.child.flags & 8192 && null !== finishedWork.memoizedState !== (null !== current && null !== current.memoizedState) && (globalMostRecentFallbackTime = now());
				flags & 4 && (flags = finishedWork.updateQueue, null !== flags && (finishedWork.updateQueue = null, attachSuspenseRetryListeners(finishedWork, flags)));
				break;
			case 22:
				hoistableRoot = null !== finishedWork.memoizedState;
				var wasHidden = null !== current && null !== current.memoizedState, prevOffscreenSubtreeIsHidden = offscreenSubtreeIsHidden, prevOffscreenSubtreeWasHidden = offscreenSubtreeWasHidden;
				offscreenSubtreeIsHidden = prevOffscreenSubtreeIsHidden || hoistableRoot;
				offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden || wasHidden;
				recursivelyTraverseMutationEffects(root, finishedWork);
				offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden;
				offscreenSubtreeIsHidden = prevOffscreenSubtreeIsHidden;
				commitReconciliationEffects(finishedWork);
				if (flags & 8192) a: for (root = finishedWork.stateNode, root._visibility = hoistableRoot ? root._visibility & -2 : root._visibility | 1, hoistableRoot && (null === current || wasHidden || offscreenSubtreeIsHidden || offscreenSubtreeWasHidden || recursivelyTraverseDisappearLayoutEffects(finishedWork)), current = null, root = finishedWork;;) {
					if (5 === root.tag || 26 === root.tag) {
						if (null === current) {
							wasHidden = current = root;
							try {
								if (currentResource = wasHidden.stateNode, hoistableRoot) maybeNodes = currentResource.style, "function" === typeof maybeNodes.setProperty ? maybeNodes.setProperty("display", "none", "important") : maybeNodes.display = "none";
								else {
									i = wasHidden.stateNode;
									var styleProp = wasHidden.memoizedProps.style, display = void 0 !== styleProp && null !== styleProp && styleProp.hasOwnProperty("display") ? styleProp.display : null;
									i.style.display = null == display || "boolean" === typeof display ? "" : ("" + display).trim();
								}
							} catch (error) {
								captureCommitPhaseError(wasHidden, wasHidden.return, error);
							}
						}
					} else if (6 === root.tag) {
						if (null === current) {
							wasHidden = root;
							try {
								wasHidden.stateNode.nodeValue = hoistableRoot ? "" : wasHidden.memoizedProps;
							} catch (error) {
								captureCommitPhaseError(wasHidden, wasHidden.return, error);
							}
						}
					} else if (18 === root.tag) {
						if (null === current) {
							wasHidden = root;
							try {
								var instance = wasHidden.stateNode;
								hoistableRoot ? hideOrUnhideDehydratedBoundary(instance, !0) : hideOrUnhideDehydratedBoundary(wasHidden.stateNode, !1);
							} catch (error) {
								captureCommitPhaseError(wasHidden, wasHidden.return, error);
							}
						}
					} else if ((22 !== root.tag && 23 !== root.tag || null === root.memoizedState || root === finishedWork) && null !== root.child) {
						root.child.return = root;
						root = root.child;
						continue;
					}
					if (root === finishedWork) break a;
					for (; null === root.sibling;) {
						if (null === root.return || root.return === finishedWork) break a;
						current === root && (current = null);
						root = root.return;
					}
					current === root && (current = null);
					root.sibling.return = root.return;
					root = root.sibling;
				}
				flags & 4 && (flags = finishedWork.updateQueue, null !== flags && (current = flags.retryQueue, null !== current && (flags.retryQueue = null, attachSuspenseRetryListeners(finishedWork, current))));
				break;
			case 19:
				recursivelyTraverseMutationEffects(root, finishedWork);
				commitReconciliationEffects(finishedWork);
				flags & 4 && (flags = finishedWork.updateQueue, null !== flags && (finishedWork.updateQueue = null, attachSuspenseRetryListeners(finishedWork, flags)));
				break;
			case 30: break;
			case 21: break;
			default: recursivelyTraverseMutationEffects(root, finishedWork), commitReconciliationEffects(finishedWork);
		}
	}
	function commitReconciliationEffects(finishedWork) {
		var flags = finishedWork.flags;
		if (flags & 2) {
			try {
				for (var hostParentFiber, parentFiber = finishedWork.return; null !== parentFiber;) {
					if (isHostParent(parentFiber)) {
						hostParentFiber = parentFiber;
						break;
					}
					parentFiber = parentFiber.return;
				}
				if (null == hostParentFiber) throw Error(formatProdErrorMessage(160));
				switch (hostParentFiber.tag) {
					case 27:
						var parent = hostParentFiber.stateNode;
						insertOrAppendPlacementNode(finishedWork, getHostSibling(finishedWork), parent);
						break;
					case 5:
						var parent$141 = hostParentFiber.stateNode;
						hostParentFiber.flags & 32 && (setTextContent(parent$141, ""), hostParentFiber.flags &= -33);
						insertOrAppendPlacementNode(finishedWork, getHostSibling(finishedWork), parent$141);
						break;
					case 3:
					case 4:
						var parent$143 = hostParentFiber.stateNode.containerInfo;
						insertOrAppendPlacementNodeIntoContainer(finishedWork, getHostSibling(finishedWork), parent$143);
						break;
					default: throw Error(formatProdErrorMessage(161));
				}
			} catch (error) {
				captureCommitPhaseError(finishedWork, finishedWork.return, error);
			}
			finishedWork.flags &= -3;
		}
		flags & 4096 && (finishedWork.flags &= -4097);
	}
	function recursivelyResetForms(parentFiber) {
		if (parentFiber.subtreeFlags & 1024) for (parentFiber = parentFiber.child; null !== parentFiber;) {
			var fiber = parentFiber;
			recursivelyResetForms(fiber);
			5 === fiber.tag && fiber.flags & 1024 && fiber.stateNode.reset();
			parentFiber = parentFiber.sibling;
		}
	}
	function recursivelyTraverseLayoutEffects(root, parentFiber) {
		if (parentFiber.subtreeFlags & 8772) for (parentFiber = parentFiber.child; null !== parentFiber;) commitLayoutEffectOnFiber(root, parentFiber.alternate, parentFiber), parentFiber = parentFiber.sibling;
	}
	function recursivelyTraverseDisappearLayoutEffects(parentFiber) {
		for (parentFiber = parentFiber.child; null !== parentFiber;) {
			var finishedWork = parentFiber;
			switch (finishedWork.tag) {
				case 0:
				case 11:
				case 14:
				case 15:
					commitHookEffectListUnmount(4, finishedWork, finishedWork.return);
					recursivelyTraverseDisappearLayoutEffects(finishedWork);
					break;
				case 1:
					safelyDetachRef(finishedWork, finishedWork.return);
					var instance = finishedWork.stateNode;
					"function" === typeof instance.componentWillUnmount && safelyCallComponentWillUnmount(finishedWork, finishedWork.return, instance);
					recursivelyTraverseDisappearLayoutEffects(finishedWork);
					break;
				case 27: releaseSingletonInstance(finishedWork.stateNode);
				case 26:
				case 5:
					safelyDetachRef(finishedWork, finishedWork.return);
					recursivelyTraverseDisappearLayoutEffects(finishedWork);
					break;
				case 22:
					null === finishedWork.memoizedState && recursivelyTraverseDisappearLayoutEffects(finishedWork);
					break;
				case 30:
					recursivelyTraverseDisappearLayoutEffects(finishedWork);
					break;
				default: recursivelyTraverseDisappearLayoutEffects(finishedWork);
			}
			parentFiber = parentFiber.sibling;
		}
	}
	function recursivelyTraverseReappearLayoutEffects(finishedRoot$jscomp$0, parentFiber, includeWorkInProgressEffects) {
		includeWorkInProgressEffects = includeWorkInProgressEffects && 0 !== (parentFiber.subtreeFlags & 8772);
		for (parentFiber = parentFiber.child; null !== parentFiber;) {
			var current = parentFiber.alternate, finishedRoot = finishedRoot$jscomp$0, finishedWork = parentFiber, flags = finishedWork.flags;
			switch (finishedWork.tag) {
				case 0:
				case 11:
				case 15:
					recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, includeWorkInProgressEffects);
					commitHookEffectListMount(4, finishedWork);
					break;
				case 1:
					recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, includeWorkInProgressEffects);
					current = finishedWork;
					finishedRoot = current.stateNode;
					if ("function" === typeof finishedRoot.componentDidMount) try {
						finishedRoot.componentDidMount();
					} catch (error) {
						captureCommitPhaseError(current, current.return, error);
					}
					current = finishedWork;
					finishedRoot = current.updateQueue;
					if (null !== finishedRoot) {
						var instance = current.stateNode;
						try {
							var hiddenCallbacks = finishedRoot.shared.hiddenCallbacks;
							if (null !== hiddenCallbacks) for (finishedRoot.shared.hiddenCallbacks = null, finishedRoot = 0; finishedRoot < hiddenCallbacks.length; finishedRoot++) callCallback(hiddenCallbacks[finishedRoot], instance);
						} catch (error) {
							captureCommitPhaseError(current, current.return, error);
						}
					}
					includeWorkInProgressEffects && flags & 64 && commitClassCallbacks(finishedWork);
					safelyAttachRef(finishedWork, finishedWork.return);
					break;
				case 27: commitHostSingletonAcquisition(finishedWork);
				case 26:
				case 5:
					recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, includeWorkInProgressEffects);
					includeWorkInProgressEffects && null === current && flags & 4 && commitHostMount(finishedWork);
					safelyAttachRef(finishedWork, finishedWork.return);
					break;
				case 12:
					recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, includeWorkInProgressEffects);
					break;
				case 31:
					recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, includeWorkInProgressEffects);
					includeWorkInProgressEffects && flags & 4 && commitActivityHydrationCallbacks(finishedRoot, finishedWork);
					break;
				case 13:
					recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, includeWorkInProgressEffects);
					includeWorkInProgressEffects && flags & 4 && commitSuspenseHydrationCallbacks(finishedRoot, finishedWork);
					break;
				case 22:
					null === finishedWork.memoizedState && recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, includeWorkInProgressEffects);
					safelyAttachRef(finishedWork, finishedWork.return);
					break;
				case 30: break;
				default: recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, includeWorkInProgressEffects);
			}
			parentFiber = parentFiber.sibling;
		}
	}
	function commitOffscreenPassiveMountEffects(current, finishedWork) {
		var previousCache = null;
		null !== current && null !== current.memoizedState && null !== current.memoizedState.cachePool && (previousCache = current.memoizedState.cachePool.pool);
		current = null;
		null !== finishedWork.memoizedState && null !== finishedWork.memoizedState.cachePool && (current = finishedWork.memoizedState.cachePool.pool);
		current !== previousCache && (null != current && current.refCount++, null != previousCache && releaseCache(previousCache));
	}
	function commitCachePassiveMountEffect(current, finishedWork) {
		current = null;
		null !== finishedWork.alternate && (current = finishedWork.alternate.memoizedState.cache);
		finishedWork = finishedWork.memoizedState.cache;
		finishedWork !== current && (finishedWork.refCount++, null != current && releaseCache(current));
	}
	function recursivelyTraversePassiveMountEffects(root, parentFiber, committedLanes, committedTransitions) {
		if (parentFiber.subtreeFlags & 10256) for (parentFiber = parentFiber.child; null !== parentFiber;) commitPassiveMountOnFiber(root, parentFiber, committedLanes, committedTransitions), parentFiber = parentFiber.sibling;
	}
	function commitPassiveMountOnFiber(finishedRoot, finishedWork, committedLanes, committedTransitions) {
		var flags = finishedWork.flags;
		switch (finishedWork.tag) {
			case 0:
			case 11:
			case 15:
				recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
				flags & 2048 && commitHookEffectListMount(9, finishedWork);
				break;
			case 1:
				recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
				break;
			case 3:
				recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
				flags & 2048 && (finishedRoot = null, null !== finishedWork.alternate && (finishedRoot = finishedWork.alternate.memoizedState.cache), finishedWork = finishedWork.memoizedState.cache, finishedWork !== finishedRoot && (finishedWork.refCount++, null != finishedRoot && releaseCache(finishedRoot)));
				break;
			case 12:
				if (flags & 2048) {
					recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
					finishedRoot = finishedWork.stateNode;
					try {
						var _finishedWork$memoize2 = finishedWork.memoizedProps, id = _finishedWork$memoize2.id, onPostCommit = _finishedWork$memoize2.onPostCommit;
						"function" === typeof onPostCommit && onPostCommit(id, null === finishedWork.alternate ? "mount" : "update", finishedRoot.passiveEffectDuration, -0);
					} catch (error) {
						captureCommitPhaseError(finishedWork, finishedWork.return, error);
					}
				} else recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
				break;
			case 31:
				recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
				break;
			case 13:
				recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
				break;
			case 23: break;
			case 22:
				_finishedWork$memoize2 = finishedWork.stateNode;
				id = finishedWork.alternate;
				null !== finishedWork.memoizedState ? _finishedWork$memoize2._visibility & 2 ? recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions) : recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork) : _finishedWork$memoize2._visibility & 2 ? recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions) : (_finishedWork$memoize2._visibility |= 2, recursivelyTraverseReconnectPassiveEffects(finishedRoot, finishedWork, committedLanes, committedTransitions, 0 !== (finishedWork.subtreeFlags & 10256) || !1));
				flags & 2048 && commitOffscreenPassiveMountEffects(id, finishedWork);
				break;
			case 24:
				recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
				flags & 2048 && commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
				break;
			default: recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
		}
	}
	function recursivelyTraverseReconnectPassiveEffects(finishedRoot$jscomp$0, parentFiber, committedLanes$jscomp$0, committedTransitions$jscomp$0, includeWorkInProgressEffects) {
		includeWorkInProgressEffects = includeWorkInProgressEffects && (0 !== (parentFiber.subtreeFlags & 10256) || !1);
		for (parentFiber = parentFiber.child; null !== parentFiber;) {
			var finishedRoot = finishedRoot$jscomp$0, finishedWork = parentFiber, committedLanes = committedLanes$jscomp$0, committedTransitions = committedTransitions$jscomp$0, flags = finishedWork.flags;
			switch (finishedWork.tag) {
				case 0:
				case 11:
				case 15:
					recursivelyTraverseReconnectPassiveEffects(finishedRoot, finishedWork, committedLanes, committedTransitions, includeWorkInProgressEffects);
					commitHookEffectListMount(8, finishedWork);
					break;
				case 23: break;
				case 22:
					var instance = finishedWork.stateNode;
					null !== finishedWork.memoizedState ? instance._visibility & 2 ? recursivelyTraverseReconnectPassiveEffects(finishedRoot, finishedWork, committedLanes, committedTransitions, includeWorkInProgressEffects) : recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork) : (instance._visibility |= 2, recursivelyTraverseReconnectPassiveEffects(finishedRoot, finishedWork, committedLanes, committedTransitions, includeWorkInProgressEffects));
					includeWorkInProgressEffects && flags & 2048 && commitOffscreenPassiveMountEffects(finishedWork.alternate, finishedWork);
					break;
				case 24:
					recursivelyTraverseReconnectPassiveEffects(finishedRoot, finishedWork, committedLanes, committedTransitions, includeWorkInProgressEffects);
					includeWorkInProgressEffects && flags & 2048 && commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
					break;
				default: recursivelyTraverseReconnectPassiveEffects(finishedRoot, finishedWork, committedLanes, committedTransitions, includeWorkInProgressEffects);
			}
			parentFiber = parentFiber.sibling;
		}
	}
	function recursivelyTraverseAtomicPassiveEffects(finishedRoot$jscomp$0, parentFiber) {
		if (parentFiber.subtreeFlags & 10256) for (parentFiber = parentFiber.child; null !== parentFiber;) {
			var finishedRoot = finishedRoot$jscomp$0, finishedWork = parentFiber, flags = finishedWork.flags;
			switch (finishedWork.tag) {
				case 22:
					recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
					flags & 2048 && commitOffscreenPassiveMountEffects(finishedWork.alternate, finishedWork);
					break;
				case 24:
					recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
					flags & 2048 && commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
					break;
				default: recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
			}
			parentFiber = parentFiber.sibling;
		}
	}
	var suspenseyCommitFlag = 8192;
	function recursivelyAccumulateSuspenseyCommit(parentFiber, committedLanes, suspendedState) {
		if (parentFiber.subtreeFlags & suspenseyCommitFlag) for (parentFiber = parentFiber.child; null !== parentFiber;) accumulateSuspenseyCommitOnFiber(parentFiber, committedLanes, suspendedState), parentFiber = parentFiber.sibling;
	}
	function accumulateSuspenseyCommitOnFiber(fiber, committedLanes, suspendedState) {
		switch (fiber.tag) {
			case 26:
				recursivelyAccumulateSuspenseyCommit(fiber, committedLanes, suspendedState);
				fiber.flags & suspenseyCommitFlag && null !== fiber.memoizedState && suspendResource(suspendedState, currentHoistableRoot, fiber.memoizedState, fiber.memoizedProps);
				break;
			case 5:
				recursivelyAccumulateSuspenseyCommit(fiber, committedLanes, suspendedState);
				break;
			case 3:
			case 4:
				var previousHoistableRoot = currentHoistableRoot;
				currentHoistableRoot = getHoistableRoot(fiber.stateNode.containerInfo);
				recursivelyAccumulateSuspenseyCommit(fiber, committedLanes, suspendedState);
				currentHoistableRoot = previousHoistableRoot;
				break;
			case 22:
				null === fiber.memoizedState && (previousHoistableRoot = fiber.alternate, null !== previousHoistableRoot && null !== previousHoistableRoot.memoizedState ? (previousHoistableRoot = suspenseyCommitFlag, suspenseyCommitFlag = 16777216, recursivelyAccumulateSuspenseyCommit(fiber, committedLanes, suspendedState), suspenseyCommitFlag = previousHoistableRoot) : recursivelyAccumulateSuspenseyCommit(fiber, committedLanes, suspendedState));
				break;
			default: recursivelyAccumulateSuspenseyCommit(fiber, committedLanes, suspendedState);
		}
	}
	function detachAlternateSiblings(parentFiber) {
		var previousFiber = parentFiber.alternate;
		if (null !== previousFiber && (parentFiber = previousFiber.child, null !== parentFiber)) {
			previousFiber.child = null;
			do
				previousFiber = parentFiber.sibling, parentFiber.sibling = null, parentFiber = previousFiber;
			while (null !== parentFiber);
		}
	}
	function recursivelyTraversePassiveUnmountEffects(parentFiber) {
		var deletions = parentFiber.deletions;
		if (0 !== (parentFiber.flags & 16)) {
			if (null !== deletions) for (var i = 0; i < deletions.length; i++) {
				var childToDelete = deletions[i];
				nextEffect = childToDelete;
				commitPassiveUnmountEffectsInsideOfDeletedTree_begin(childToDelete, parentFiber);
			}
			detachAlternateSiblings(parentFiber);
		}
		if (parentFiber.subtreeFlags & 10256) for (parentFiber = parentFiber.child; null !== parentFiber;) commitPassiveUnmountOnFiber(parentFiber), parentFiber = parentFiber.sibling;
	}
	function commitPassiveUnmountOnFiber(finishedWork) {
		switch (finishedWork.tag) {
			case 0:
			case 11:
			case 15:
				recursivelyTraversePassiveUnmountEffects(finishedWork);
				finishedWork.flags & 2048 && commitHookEffectListUnmount(9, finishedWork, finishedWork.return);
				break;
			case 3:
				recursivelyTraversePassiveUnmountEffects(finishedWork);
				break;
			case 12:
				recursivelyTraversePassiveUnmountEffects(finishedWork);
				break;
			case 22:
				var instance = finishedWork.stateNode;
				null !== finishedWork.memoizedState && instance._visibility & 2 && (null === finishedWork.return || 13 !== finishedWork.return.tag) ? (instance._visibility &= -3, recursivelyTraverseDisconnectPassiveEffects(finishedWork)) : recursivelyTraversePassiveUnmountEffects(finishedWork);
				break;
			default: recursivelyTraversePassiveUnmountEffects(finishedWork);
		}
	}
	function recursivelyTraverseDisconnectPassiveEffects(parentFiber) {
		var deletions = parentFiber.deletions;
		if (0 !== (parentFiber.flags & 16)) {
			if (null !== deletions) for (var i = 0; i < deletions.length; i++) {
				var childToDelete = deletions[i];
				nextEffect = childToDelete;
				commitPassiveUnmountEffectsInsideOfDeletedTree_begin(childToDelete, parentFiber);
			}
			detachAlternateSiblings(parentFiber);
		}
		for (parentFiber = parentFiber.child; null !== parentFiber;) {
			deletions = parentFiber;
			switch (deletions.tag) {
				case 0:
				case 11:
				case 15:
					commitHookEffectListUnmount(8, deletions, deletions.return);
					recursivelyTraverseDisconnectPassiveEffects(deletions);
					break;
				case 22:
					i = deletions.stateNode;
					i._visibility & 2 && (i._visibility &= -3, recursivelyTraverseDisconnectPassiveEffects(deletions));
					break;
				default: recursivelyTraverseDisconnectPassiveEffects(deletions);
			}
			parentFiber = parentFiber.sibling;
		}
	}
	function commitPassiveUnmountEffectsInsideOfDeletedTree_begin(deletedSubtreeRoot, nearestMountedAncestor) {
		for (; null !== nextEffect;) {
			var fiber = nextEffect;
			switch (fiber.tag) {
				case 0:
				case 11:
				case 15:
					commitHookEffectListUnmount(8, fiber, nearestMountedAncestor);
					break;
				case 23:
				case 22:
					if (null !== fiber.memoizedState && null !== fiber.memoizedState.cachePool) {
						var cache = fiber.memoizedState.cachePool.pool;
						null != cache && cache.refCount++;
					}
					break;
				case 24: releaseCache(fiber.memoizedState.cache);
			}
			cache = fiber.child;
			if (null !== cache) cache.return = fiber, nextEffect = cache;
			else a: for (fiber = deletedSubtreeRoot; null !== nextEffect;) {
				cache = nextEffect;
				var sibling = cache.sibling, returnFiber = cache.return;
				detachFiberAfterEffects(cache);
				if (cache === fiber) {
					nextEffect = null;
					break a;
				}
				if (null !== sibling) {
					sibling.return = returnFiber;
					nextEffect = sibling;
					break a;
				}
				nextEffect = returnFiber;
			}
		}
	}
	var DefaultAsyncDispatcher = {
		getCacheForType: function(resourceType) {
			var cache = readContext(CacheContext), cacheForType = cache.data.get(resourceType);
			void 0 === cacheForType && (cacheForType = resourceType(), cache.data.set(resourceType, cacheForType));
			return cacheForType;
		},
		cacheSignal: function() {
			return readContext(CacheContext).controller.signal;
		}
	}, PossiblyWeakMap = "function" === typeof WeakMap ? WeakMap : Map, executionContext = 0, workInProgressRoot = null, workInProgress = null, workInProgressRootRenderLanes = 0, workInProgressSuspendedReason = 0, workInProgressThrownValue = null, workInProgressRootDidSkipSuspendedSiblings = !1, workInProgressRootIsPrerendering = !1, workInProgressRootDidAttachPingListener = !1, entangledRenderLanes = 0, workInProgressRootExitStatus = 0, workInProgressRootSkippedLanes = 0, workInProgressRootInterleavedUpdatedLanes = 0, workInProgressRootPingedLanes = 0, workInProgressDeferredLane = 0, workInProgressSuspendedRetryLanes = 0, workInProgressRootConcurrentErrors = null, workInProgressRootRecoverableErrors = null, workInProgressRootDidIncludeRecursiveRenderUpdate = !1, globalMostRecentFallbackTime = 0, globalMostRecentTransitionTime = 0, workInProgressRootRenderTargetTime = Infinity, workInProgressTransitions = null, legacyErrorBoundariesThatAlreadyFailed = null, pendingEffectsStatus = 0, pendingEffectsRoot = null, pendingFinishedWork = null, pendingEffectsLanes = 0, pendingEffectsRemainingLanes = 0, pendingPassiveTransitions = null, pendingRecoverableErrors = null, nestedUpdateCount = 0, rootWithNestedUpdates = null;
	function requestUpdateLane() {
		return 0 !== (executionContext & 2) && 0 !== workInProgressRootRenderLanes ? workInProgressRootRenderLanes & -workInProgressRootRenderLanes : null !== ReactSharedInternals.T ? requestTransitionLane() : resolveUpdatePriority();
	}
	function requestDeferredLane() {
		if (0 === workInProgressDeferredLane) if (0 === (workInProgressRootRenderLanes & 536870912) || isHydrating) {
			var lane = nextTransitionDeferredLane;
			nextTransitionDeferredLane <<= 1;
			0 === (nextTransitionDeferredLane & 3932160) && (nextTransitionDeferredLane = 262144);
			workInProgressDeferredLane = lane;
		} else workInProgressDeferredLane = 536870912;
		lane = suspenseHandlerStackCursor.current;
		null !== lane && (lane.flags |= 32);
		return workInProgressDeferredLane;
	}
	function scheduleUpdateOnFiber(root, fiber, lane) {
		if (root === workInProgressRoot && (2 === workInProgressSuspendedReason || 9 === workInProgressSuspendedReason) || null !== root.cancelPendingCommit) prepareFreshStack(root, 0), markRootSuspended(root, workInProgressRootRenderLanes, workInProgressDeferredLane, !1);
		markRootUpdated$1(root, lane);
		if (0 === (executionContext & 2) || root !== workInProgressRoot) root === workInProgressRoot && (0 === (executionContext & 2) && (workInProgressRootInterleavedUpdatedLanes |= lane), 4 === workInProgressRootExitStatus && markRootSuspended(root, workInProgressRootRenderLanes, workInProgressDeferredLane, !1)), ensureRootIsScheduled(root);
	}
	function performWorkOnRoot(root$jscomp$0, lanes, forceSync) {
		if (0 !== (executionContext & 6)) throw Error(formatProdErrorMessage(327));
		var shouldTimeSlice = !forceSync && 0 === (lanes & 127) && 0 === (lanes & root$jscomp$0.expiredLanes) || checkIfRootIsPrerendering(root$jscomp$0, lanes), exitStatus = shouldTimeSlice ? renderRootConcurrent(root$jscomp$0, lanes) : renderRootSync(root$jscomp$0, lanes, !0), renderWasConcurrent = shouldTimeSlice;
		do {
			if (0 === exitStatus) {
				workInProgressRootIsPrerendering && !shouldTimeSlice && markRootSuspended(root$jscomp$0, lanes, 0, !1);
				break;
			} else {
				forceSync = root$jscomp$0.current.alternate;
				if (renderWasConcurrent && !isRenderConsistentWithExternalStores(forceSync)) {
					exitStatus = renderRootSync(root$jscomp$0, lanes, !1);
					renderWasConcurrent = !1;
					continue;
				}
				if (2 === exitStatus) {
					renderWasConcurrent = lanes;
					if (root$jscomp$0.errorRecoveryDisabledLanes & renderWasConcurrent) var JSCompiler_inline_result = 0;
					else JSCompiler_inline_result = root$jscomp$0.pendingLanes & -536870913, JSCompiler_inline_result = 0 !== JSCompiler_inline_result ? JSCompiler_inline_result : JSCompiler_inline_result & 536870912 ? 536870912 : 0;
					if (0 !== JSCompiler_inline_result) {
						lanes = JSCompiler_inline_result;
						a: {
							var root = root$jscomp$0;
							exitStatus = workInProgressRootConcurrentErrors;
							var wasRootDehydrated = root.current.memoizedState.isDehydrated;
							wasRootDehydrated && (prepareFreshStack(root, JSCompiler_inline_result).flags |= 256);
							JSCompiler_inline_result = renderRootSync(root, JSCompiler_inline_result, !1);
							if (2 !== JSCompiler_inline_result) {
								if (workInProgressRootDidAttachPingListener && !wasRootDehydrated) {
									root.errorRecoveryDisabledLanes |= renderWasConcurrent;
									workInProgressRootInterleavedUpdatedLanes |= renderWasConcurrent;
									exitStatus = 4;
									break a;
								}
								renderWasConcurrent = workInProgressRootRecoverableErrors;
								workInProgressRootRecoverableErrors = exitStatus;
								null !== renderWasConcurrent && (null === workInProgressRootRecoverableErrors ? workInProgressRootRecoverableErrors = renderWasConcurrent : workInProgressRootRecoverableErrors.push.apply(workInProgressRootRecoverableErrors, renderWasConcurrent));
							}
							exitStatus = JSCompiler_inline_result;
						}
						renderWasConcurrent = !1;
						if (2 !== exitStatus) continue;
					}
				}
				if (1 === exitStatus) {
					prepareFreshStack(root$jscomp$0, 0);
					markRootSuspended(root$jscomp$0, lanes, 0, !0);
					break;
				}
				a: {
					shouldTimeSlice = root$jscomp$0;
					renderWasConcurrent = exitStatus;
					switch (renderWasConcurrent) {
						case 0:
						case 1: throw Error(formatProdErrorMessage(345));
						case 4: if ((lanes & 4194048) !== lanes) break;
						case 6:
							markRootSuspended(shouldTimeSlice, lanes, workInProgressDeferredLane, !workInProgressRootDidSkipSuspendedSiblings);
							break a;
						case 2:
							workInProgressRootRecoverableErrors = null;
							break;
						case 3:
						case 5: break;
						default: throw Error(formatProdErrorMessage(329));
					}
					if ((lanes & 62914560) === lanes && (exitStatus = globalMostRecentFallbackTime + 300 - now(), 10 < exitStatus)) {
						markRootSuspended(shouldTimeSlice, lanes, workInProgressDeferredLane, !workInProgressRootDidSkipSuspendedSiblings);
						if (0 !== getNextLanes(shouldTimeSlice, 0, !0)) break a;
						pendingEffectsLanes = lanes;
						shouldTimeSlice.timeoutHandle = scheduleTimeout(commitRootWhenReady.bind(null, shouldTimeSlice, forceSync, workInProgressRootRecoverableErrors, workInProgressTransitions, workInProgressRootDidIncludeRecursiveRenderUpdate, lanes, workInProgressDeferredLane, workInProgressRootInterleavedUpdatedLanes, workInProgressSuspendedRetryLanes, workInProgressRootDidSkipSuspendedSiblings, renderWasConcurrent, "Throttled", -0, 0), exitStatus);
						break a;
					}
					commitRootWhenReady(shouldTimeSlice, forceSync, workInProgressRootRecoverableErrors, workInProgressTransitions, workInProgressRootDidIncludeRecursiveRenderUpdate, lanes, workInProgressDeferredLane, workInProgressRootInterleavedUpdatedLanes, workInProgressSuspendedRetryLanes, workInProgressRootDidSkipSuspendedSiblings, renderWasConcurrent, null, -0, 0);
				}
			}
			break;
		} while (1);
		ensureRootIsScheduled(root$jscomp$0);
	}
	function commitRootWhenReady(root, finishedWork, recoverableErrors, transitions, didIncludeRenderPhaseUpdate, lanes, spawnedLane, updatedLanes, suspendedRetryLanes, didSkipSuspendedSiblings, exitStatus, suspendedCommitReason, completedRenderStartTime, completedRenderEndTime) {
		root.timeoutHandle = -1;
		suspendedCommitReason = finishedWork.subtreeFlags;
		if (suspendedCommitReason & 8192 || 16785408 === (suspendedCommitReason & 16785408)) {
			suspendedCommitReason = {
				stylesheets: null,
				count: 0,
				imgCount: 0,
				imgBytes: 0,
				suspenseyImages: [],
				waitingForImages: !0,
				waitingForViewTransition: !1,
				unsuspend: noop$1
			};
			accumulateSuspenseyCommitOnFiber(finishedWork, lanes, suspendedCommitReason);
			var timeoutOffset = (lanes & 62914560) === lanes ? globalMostRecentFallbackTime - now() : (lanes & 4194048) === lanes ? globalMostRecentTransitionTime - now() : 0;
			timeoutOffset = waitForCommitToBeReady(suspendedCommitReason, timeoutOffset);
			if (null !== timeoutOffset) {
				pendingEffectsLanes = lanes;
				root.cancelPendingCommit = timeoutOffset(commitRoot.bind(null, root, finishedWork, lanes, recoverableErrors, transitions, didIncludeRenderPhaseUpdate, spawnedLane, updatedLanes, suspendedRetryLanes, exitStatus, suspendedCommitReason, null, completedRenderStartTime, completedRenderEndTime));
				markRootSuspended(root, lanes, spawnedLane, !didSkipSuspendedSiblings);
				return;
			}
		}
		commitRoot(root, finishedWork, lanes, recoverableErrors, transitions, didIncludeRenderPhaseUpdate, spawnedLane, updatedLanes, suspendedRetryLanes);
	}
	function isRenderConsistentWithExternalStores(finishedWork) {
		for (var node = finishedWork;;) {
			var tag = node.tag;
			if ((0 === tag || 11 === tag || 15 === tag) && node.flags & 16384 && (tag = node.updateQueue, null !== tag && (tag = tag.stores, null !== tag))) for (var i = 0; i < tag.length; i++) {
				var check = tag[i], getSnapshot = check.getSnapshot;
				check = check.value;
				try {
					if (!objectIs(getSnapshot(), check)) return !1;
				} catch (error) {
					return !1;
				}
			}
			tag = node.child;
			if (node.subtreeFlags & 16384 && null !== tag) tag.return = node, node = tag;
			else {
				if (node === finishedWork) break;
				for (; null === node.sibling;) {
					if (null === node.return || node.return === finishedWork) return !0;
					node = node.return;
				}
				node.sibling.return = node.return;
				node = node.sibling;
			}
		}
		return !0;
	}
	function markRootSuspended(root, suspendedLanes, spawnedLane, didAttemptEntireTree) {
		suspendedLanes &= ~workInProgressRootPingedLanes;
		suspendedLanes &= ~workInProgressRootInterleavedUpdatedLanes;
		root.suspendedLanes |= suspendedLanes;
		root.pingedLanes &= ~suspendedLanes;
		didAttemptEntireTree && (root.warmLanes |= suspendedLanes);
		didAttemptEntireTree = root.expirationTimes;
		for (var lanes = suspendedLanes; 0 < lanes;) {
			var index$6 = 31 - clz32(lanes), lane = 1 << index$6;
			didAttemptEntireTree[index$6] = -1;
			lanes &= ~lane;
		}
		0 !== spawnedLane && markSpawnedDeferredLane(root, spawnedLane, suspendedLanes);
	}
	function flushSyncWork$1() {
		return 0 === (executionContext & 6) ? (flushSyncWorkAcrossRoots_impl(0, !1), !1) : !0;
	}
	function resetWorkInProgressStack() {
		if (null !== workInProgress) {
			if (0 === workInProgressSuspendedReason) var interruptedWork = workInProgress.return;
			else interruptedWork = workInProgress, lastContextDependency = currentlyRenderingFiber$1 = null, resetHooksOnUnwind(interruptedWork), thenableState$1 = null, thenableIndexCounter$1 = 0, interruptedWork = workInProgress;
			for (; null !== interruptedWork;) unwindInterruptedWork(interruptedWork.alternate, interruptedWork), interruptedWork = interruptedWork.return;
			workInProgress = null;
		}
	}
	function prepareFreshStack(root, lanes) {
		var timeoutHandle = root.timeoutHandle;
		-1 !== timeoutHandle && (root.timeoutHandle = -1, cancelTimeout(timeoutHandle));
		timeoutHandle = root.cancelPendingCommit;
		null !== timeoutHandle && (root.cancelPendingCommit = null, timeoutHandle());
		pendingEffectsLanes = 0;
		resetWorkInProgressStack();
		workInProgressRoot = root;
		workInProgress = timeoutHandle = createWorkInProgress(root.current, null);
		workInProgressRootRenderLanes = lanes;
		workInProgressSuspendedReason = 0;
		workInProgressThrownValue = null;
		workInProgressRootDidSkipSuspendedSiblings = !1;
		workInProgressRootIsPrerendering = checkIfRootIsPrerendering(root, lanes);
		workInProgressRootDidAttachPingListener = !1;
		workInProgressSuspendedRetryLanes = workInProgressDeferredLane = workInProgressRootPingedLanes = workInProgressRootInterleavedUpdatedLanes = workInProgressRootSkippedLanes = workInProgressRootExitStatus = 0;
		workInProgressRootRecoverableErrors = workInProgressRootConcurrentErrors = null;
		workInProgressRootDidIncludeRecursiveRenderUpdate = !1;
		0 !== (lanes & 8) && (lanes |= lanes & 32);
		var allEntangledLanes = root.entangledLanes;
		if (0 !== allEntangledLanes) for (root = root.entanglements, allEntangledLanes &= lanes; 0 < allEntangledLanes;) {
			var index$4 = 31 - clz32(allEntangledLanes), lane = 1 << index$4;
			lanes |= root[index$4];
			allEntangledLanes &= ~lane;
		}
		entangledRenderLanes = lanes;
		finishQueueingConcurrentUpdates();
		return timeoutHandle;
	}
	function handleThrow(root, thrownValue) {
		currentlyRenderingFiber = null;
		ReactSharedInternals.H = ContextOnlyDispatcher;
		thrownValue === SuspenseException || thrownValue === SuspenseActionException ? (thrownValue = getSuspendedThenable(), workInProgressSuspendedReason = 3) : thrownValue === SuspenseyCommitException ? (thrownValue = getSuspendedThenable(), workInProgressSuspendedReason = 4) : workInProgressSuspendedReason = thrownValue === SelectiveHydrationException ? 8 : null !== thrownValue && "object" === typeof thrownValue && "function" === typeof thrownValue.then ? 6 : 1;
		workInProgressThrownValue = thrownValue;
		null === workInProgress && (workInProgressRootExitStatus = 1, logUncaughtError(root, createCapturedValueAtFiber(thrownValue, root.current)));
	}
	function shouldRemainOnPreviousScreen() {
		var handler = suspenseHandlerStackCursor.current;
		return null === handler ? !0 : (workInProgressRootRenderLanes & 4194048) === workInProgressRootRenderLanes ? null === shellBoundary ? !0 : !1 : (workInProgressRootRenderLanes & 62914560) === workInProgressRootRenderLanes || 0 !== (workInProgressRootRenderLanes & 536870912) ? handler === shellBoundary : !1;
	}
	function pushDispatcher() {
		var prevDispatcher = ReactSharedInternals.H;
		ReactSharedInternals.H = ContextOnlyDispatcher;
		return null === prevDispatcher ? ContextOnlyDispatcher : prevDispatcher;
	}
	function pushAsyncDispatcher() {
		var prevAsyncDispatcher = ReactSharedInternals.A;
		ReactSharedInternals.A = DefaultAsyncDispatcher;
		return prevAsyncDispatcher;
	}
	function renderDidSuspendDelayIfPossible() {
		workInProgressRootExitStatus = 4;
		workInProgressRootDidSkipSuspendedSiblings || (workInProgressRootRenderLanes & 4194048) !== workInProgressRootRenderLanes && null !== suspenseHandlerStackCursor.current || (workInProgressRootIsPrerendering = !0);
		0 === (workInProgressRootSkippedLanes & 134217727) && 0 === (workInProgressRootInterleavedUpdatedLanes & 134217727) || null === workInProgressRoot || markRootSuspended(workInProgressRoot, workInProgressRootRenderLanes, workInProgressDeferredLane, !1);
	}
	function renderRootSync(root, lanes, shouldYieldForPrerendering) {
		var prevExecutionContext = executionContext;
		executionContext |= 2;
		var prevDispatcher = pushDispatcher(), prevAsyncDispatcher = pushAsyncDispatcher();
		if (workInProgressRoot !== root || workInProgressRootRenderLanes !== lanes) workInProgressTransitions = null, prepareFreshStack(root, lanes);
		lanes = !1;
		var exitStatus = workInProgressRootExitStatus;
		a: do
			try {
				if (0 !== workInProgressSuspendedReason && null !== workInProgress) {
					var unitOfWork = workInProgress, thrownValue = workInProgressThrownValue;
					switch (workInProgressSuspendedReason) {
						case 8:
							resetWorkInProgressStack();
							exitStatus = 6;
							break a;
						case 3:
						case 2:
						case 9:
						case 6:
							null === suspenseHandlerStackCursor.current && (lanes = !0);
							var reason = workInProgressSuspendedReason;
							workInProgressSuspendedReason = 0;
							workInProgressThrownValue = null;
							throwAndUnwindWorkLoop(root, unitOfWork, thrownValue, reason);
							if (shouldYieldForPrerendering && workInProgressRootIsPrerendering) {
								exitStatus = 0;
								break a;
							}
							break;
						default: reason = workInProgressSuspendedReason, workInProgressSuspendedReason = 0, workInProgressThrownValue = null, throwAndUnwindWorkLoop(root, unitOfWork, thrownValue, reason);
					}
				}
				workLoopSync();
				exitStatus = workInProgressRootExitStatus;
				break;
			} catch (thrownValue$165) {
				handleThrow(root, thrownValue$165);
			}
		while (1);
		lanes && root.shellSuspendCounter++;
		lastContextDependency = currentlyRenderingFiber$1 = null;
		executionContext = prevExecutionContext;
		ReactSharedInternals.H = prevDispatcher;
		ReactSharedInternals.A = prevAsyncDispatcher;
		null === workInProgress && (workInProgressRoot = null, workInProgressRootRenderLanes = 0, finishQueueingConcurrentUpdates());
		return exitStatus;
	}
	function workLoopSync() {
		for (; null !== workInProgress;) performUnitOfWork(workInProgress);
	}
	function renderRootConcurrent(root, lanes) {
		var prevExecutionContext = executionContext;
		executionContext |= 2;
		var prevDispatcher = pushDispatcher(), prevAsyncDispatcher = pushAsyncDispatcher();
		workInProgressRoot !== root || workInProgressRootRenderLanes !== lanes ? (workInProgressTransitions = null, workInProgressRootRenderTargetTime = now() + 500, prepareFreshStack(root, lanes)) : workInProgressRootIsPrerendering = checkIfRootIsPrerendering(root, lanes);
		a: do
			try {
				if (0 !== workInProgressSuspendedReason && null !== workInProgress) {
					lanes = workInProgress;
					var thrownValue = workInProgressThrownValue;
					b: switch (workInProgressSuspendedReason) {
						case 1:
							workInProgressSuspendedReason = 0;
							workInProgressThrownValue = null;
							throwAndUnwindWorkLoop(root, lanes, thrownValue, 1);
							break;
						case 2:
						case 9:
							if (isThenableResolved(thrownValue)) {
								workInProgressSuspendedReason = 0;
								workInProgressThrownValue = null;
								replaySuspendedUnitOfWork(lanes);
								break;
							}
							lanes = function() {
								2 !== workInProgressSuspendedReason && 9 !== workInProgressSuspendedReason || workInProgressRoot !== root || (workInProgressSuspendedReason = 7);
								ensureRootIsScheduled(root);
							};
							thrownValue.then(lanes, lanes);
							break a;
						case 3:
							workInProgressSuspendedReason = 7;
							break a;
						case 4:
							workInProgressSuspendedReason = 5;
							break a;
						case 7:
							isThenableResolved(thrownValue) ? (workInProgressSuspendedReason = 0, workInProgressThrownValue = null, replaySuspendedUnitOfWork(lanes)) : (workInProgressSuspendedReason = 0, workInProgressThrownValue = null, throwAndUnwindWorkLoop(root, lanes, thrownValue, 7));
							break;
						case 5:
							var resource = null;
							switch (workInProgress.tag) {
								case 26: resource = workInProgress.memoizedState;
								case 5:
								case 27:
									var hostFiber = workInProgress;
									if (resource ? preloadResource(resource) : hostFiber.stateNode.complete) {
										workInProgressSuspendedReason = 0;
										workInProgressThrownValue = null;
										var sibling = hostFiber.sibling;
										if (null !== sibling) workInProgress = sibling;
										else {
											var returnFiber = hostFiber.return;
											null !== returnFiber ? (workInProgress = returnFiber, completeUnitOfWork(returnFiber)) : workInProgress = null;
										}
										break b;
									}
							}
							workInProgressSuspendedReason = 0;
							workInProgressThrownValue = null;
							throwAndUnwindWorkLoop(root, lanes, thrownValue, 5);
							break;
						case 6:
							workInProgressSuspendedReason = 0;
							workInProgressThrownValue = null;
							throwAndUnwindWorkLoop(root, lanes, thrownValue, 6);
							break;
						case 8:
							resetWorkInProgressStack();
							workInProgressRootExitStatus = 6;
							break a;
						default: throw Error(formatProdErrorMessage(462));
					}
				}
				workLoopConcurrentByScheduler();
				break;
			} catch (thrownValue$167) {
				handleThrow(root, thrownValue$167);
			}
		while (1);
		lastContextDependency = currentlyRenderingFiber$1 = null;
		ReactSharedInternals.H = prevDispatcher;
		ReactSharedInternals.A = prevAsyncDispatcher;
		executionContext = prevExecutionContext;
		if (null !== workInProgress) return 0;
		workInProgressRoot = null;
		workInProgressRootRenderLanes = 0;
		finishQueueingConcurrentUpdates();
		return workInProgressRootExitStatus;
	}
	function workLoopConcurrentByScheduler() {
		for (; null !== workInProgress && !shouldYield();) performUnitOfWork(workInProgress);
	}
	function performUnitOfWork(unitOfWork) {
		var next = beginWork(unitOfWork.alternate, unitOfWork, entangledRenderLanes);
		unitOfWork.memoizedProps = unitOfWork.pendingProps;
		null === next ? completeUnitOfWork(unitOfWork) : workInProgress = next;
	}
	function replaySuspendedUnitOfWork(unitOfWork) {
		var next = unitOfWork;
		var current = next.alternate;
		switch (next.tag) {
			case 15:
			case 0:
				next = replayFunctionComponent(current, next, next.pendingProps, next.type, void 0, workInProgressRootRenderLanes);
				break;
			case 11:
				next = replayFunctionComponent(current, next, next.pendingProps, next.type.render, next.ref, workInProgressRootRenderLanes);
				break;
			case 5: resetHooksOnUnwind(next);
			default: unwindInterruptedWork(current, next), next = workInProgress = resetWorkInProgress(next, entangledRenderLanes), next = beginWork(current, next, entangledRenderLanes);
		}
		unitOfWork.memoizedProps = unitOfWork.pendingProps;
		null === next ? completeUnitOfWork(unitOfWork) : workInProgress = next;
	}
	function throwAndUnwindWorkLoop(root, unitOfWork, thrownValue, suspendedReason) {
		lastContextDependency = currentlyRenderingFiber$1 = null;
		resetHooksOnUnwind(unitOfWork);
		thenableState$1 = null;
		thenableIndexCounter$1 = 0;
		var returnFiber = unitOfWork.return;
		try {
			if (throwException(root, returnFiber, unitOfWork, thrownValue, workInProgressRootRenderLanes)) {
				workInProgressRootExitStatus = 1;
				logUncaughtError(root, createCapturedValueAtFiber(thrownValue, root.current));
				workInProgress = null;
				return;
			}
		} catch (error) {
			if (null !== returnFiber) throw workInProgress = returnFiber, error;
			workInProgressRootExitStatus = 1;
			logUncaughtError(root, createCapturedValueAtFiber(thrownValue, root.current));
			workInProgress = null;
			return;
		}
		if (unitOfWork.flags & 32768) {
			if (isHydrating || 1 === suspendedReason) root = !0;
			else if (workInProgressRootIsPrerendering || 0 !== (workInProgressRootRenderLanes & 536870912)) root = !1;
			else if (workInProgressRootDidSkipSuspendedSiblings = root = !0, 2 === suspendedReason || 9 === suspendedReason || 3 === suspendedReason || 6 === suspendedReason) suspendedReason = suspenseHandlerStackCursor.current, null !== suspendedReason && 13 === suspendedReason.tag && (suspendedReason.flags |= 16384);
			unwindUnitOfWork(unitOfWork, root);
		} else completeUnitOfWork(unitOfWork);
	}
	function completeUnitOfWork(unitOfWork) {
		var completedWork = unitOfWork;
		do {
			if (0 !== (completedWork.flags & 32768)) {
				unwindUnitOfWork(completedWork, workInProgressRootDidSkipSuspendedSiblings);
				return;
			}
			unitOfWork = completedWork.return;
			var next = completeWork(completedWork.alternate, completedWork, entangledRenderLanes);
			if (null !== next) {
				workInProgress = next;
				return;
			}
			completedWork = completedWork.sibling;
			if (null !== completedWork) {
				workInProgress = completedWork;
				return;
			}
			workInProgress = completedWork = unitOfWork;
		} while (null !== completedWork);
		0 === workInProgressRootExitStatus && (workInProgressRootExitStatus = 5);
	}
	function unwindUnitOfWork(unitOfWork, skipSiblings) {
		do {
			var next = unwindWork(unitOfWork.alternate, unitOfWork);
			if (null !== next) {
				next.flags &= 32767;
				workInProgress = next;
				return;
			}
			next = unitOfWork.return;
			null !== next && (next.flags |= 32768, next.subtreeFlags = 0, next.deletions = null);
			if (!skipSiblings && (unitOfWork = unitOfWork.sibling, null !== unitOfWork)) {
				workInProgress = unitOfWork;
				return;
			}
			workInProgress = unitOfWork = next;
		} while (null !== unitOfWork);
		workInProgressRootExitStatus = 6;
		workInProgress = null;
	}
	function commitRoot(root, finishedWork, lanes, recoverableErrors, transitions, didIncludeRenderPhaseUpdate, spawnedLane, updatedLanes, suspendedRetryLanes) {
		root.cancelPendingCommit = null;
		do
			flushPendingEffects();
		while (0 !== pendingEffectsStatus);
		if (0 !== (executionContext & 6)) throw Error(formatProdErrorMessage(327));
		if (null !== finishedWork) {
			if (finishedWork === root.current) throw Error(formatProdErrorMessage(177));
			didIncludeRenderPhaseUpdate = finishedWork.lanes | finishedWork.childLanes;
			didIncludeRenderPhaseUpdate |= concurrentlyUpdatedLanes;
			markRootFinished(root, lanes, didIncludeRenderPhaseUpdate, spawnedLane, updatedLanes, suspendedRetryLanes);
			root === workInProgressRoot && (workInProgress = workInProgressRoot = null, workInProgressRootRenderLanes = 0);
			pendingFinishedWork = finishedWork;
			pendingEffectsRoot = root;
			pendingEffectsLanes = lanes;
			pendingEffectsRemainingLanes = didIncludeRenderPhaseUpdate;
			pendingPassiveTransitions = transitions;
			pendingRecoverableErrors = recoverableErrors;
			0 !== (finishedWork.subtreeFlags & 10256) || 0 !== (finishedWork.flags & 10256) ? (root.callbackNode = null, root.callbackPriority = 0, scheduleCallback$1(NormalPriority$1, function() {
				flushPassiveEffects();
				return null;
			})) : (root.callbackNode = null, root.callbackPriority = 0);
			recoverableErrors = 0 !== (finishedWork.flags & 13878);
			if (0 !== (finishedWork.subtreeFlags & 13878) || recoverableErrors) {
				recoverableErrors = ReactSharedInternals.T;
				ReactSharedInternals.T = null;
				transitions = ReactDOMSharedInternals.p;
				ReactDOMSharedInternals.p = 2;
				spawnedLane = executionContext;
				executionContext |= 4;
				try {
					commitBeforeMutationEffects(root, finishedWork, lanes);
				} finally {
					executionContext = spawnedLane, ReactDOMSharedInternals.p = transitions, ReactSharedInternals.T = recoverableErrors;
				}
			}
			pendingEffectsStatus = 1;
			flushMutationEffects();
			flushLayoutEffects();
			flushSpawnedWork();
		}
	}
	function flushMutationEffects() {
		if (1 === pendingEffectsStatus) {
			pendingEffectsStatus = 0;
			var root = pendingEffectsRoot, finishedWork = pendingFinishedWork, rootMutationHasEffect = 0 !== (finishedWork.flags & 13878);
			if (0 !== (finishedWork.subtreeFlags & 13878) || rootMutationHasEffect) {
				rootMutationHasEffect = ReactSharedInternals.T;
				ReactSharedInternals.T = null;
				var previousPriority = ReactDOMSharedInternals.p;
				ReactDOMSharedInternals.p = 2;
				var prevExecutionContext = executionContext;
				executionContext |= 4;
				try {
					commitMutationEffectsOnFiber(finishedWork, root);
					var priorSelectionInformation = selectionInformation, curFocusedElem = getActiveElementDeep(root.containerInfo), priorFocusedElem = priorSelectionInformation.focusedElem, priorSelectionRange = priorSelectionInformation.selectionRange;
					if (curFocusedElem !== priorFocusedElem && priorFocusedElem && priorFocusedElem.ownerDocument && containsNode(priorFocusedElem.ownerDocument.documentElement, priorFocusedElem)) {
						if (null !== priorSelectionRange && hasSelectionCapabilities(priorFocusedElem)) {
							var start = priorSelectionRange.start, end = priorSelectionRange.end;
							void 0 === end && (end = start);
							if ("selectionStart" in priorFocusedElem) priorFocusedElem.selectionStart = start, priorFocusedElem.selectionEnd = Math.min(end, priorFocusedElem.value.length);
							else {
								var doc = priorFocusedElem.ownerDocument || document, win = doc && doc.defaultView || window;
								if (win.getSelection) {
									var selection = win.getSelection(), length = priorFocusedElem.textContent.length, start$jscomp$0 = Math.min(priorSelectionRange.start, length), end$jscomp$0 = void 0 === priorSelectionRange.end ? start$jscomp$0 : Math.min(priorSelectionRange.end, length);
									!selection.extend && start$jscomp$0 > end$jscomp$0 && (curFocusedElem = end$jscomp$0, end$jscomp$0 = start$jscomp$0, start$jscomp$0 = curFocusedElem);
									var startMarker = getNodeForCharacterOffset(priorFocusedElem, start$jscomp$0), endMarker = getNodeForCharacterOffset(priorFocusedElem, end$jscomp$0);
									if (startMarker && endMarker && (1 !== selection.rangeCount || selection.anchorNode !== startMarker.node || selection.anchorOffset !== startMarker.offset || selection.focusNode !== endMarker.node || selection.focusOffset !== endMarker.offset)) {
										var range = doc.createRange();
										range.setStart(startMarker.node, startMarker.offset);
										selection.removeAllRanges();
										start$jscomp$0 > end$jscomp$0 ? (selection.addRange(range), selection.extend(endMarker.node, endMarker.offset)) : (range.setEnd(endMarker.node, endMarker.offset), selection.addRange(range));
									}
								}
							}
						}
						doc = [];
						for (selection = priorFocusedElem; selection = selection.parentNode;) 1 === selection.nodeType && doc.push({
							element: selection,
							left: selection.scrollLeft,
							top: selection.scrollTop
						});
						"function" === typeof priorFocusedElem.focus && priorFocusedElem.focus();
						for (priorFocusedElem = 0; priorFocusedElem < doc.length; priorFocusedElem++) {
							var info = doc[priorFocusedElem];
							info.element.scrollLeft = info.left;
							info.element.scrollTop = info.top;
						}
					}
					_enabled = !!eventsEnabled;
					selectionInformation = eventsEnabled = null;
				} finally {
					executionContext = prevExecutionContext, ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = rootMutationHasEffect;
				}
			}
			root.current = finishedWork;
			pendingEffectsStatus = 2;
		}
	}
	function flushLayoutEffects() {
		if (2 === pendingEffectsStatus) {
			pendingEffectsStatus = 0;
			var root = pendingEffectsRoot, finishedWork = pendingFinishedWork, rootHasLayoutEffect = 0 !== (finishedWork.flags & 8772);
			if (0 !== (finishedWork.subtreeFlags & 8772) || rootHasLayoutEffect) {
				rootHasLayoutEffect = ReactSharedInternals.T;
				ReactSharedInternals.T = null;
				var previousPriority = ReactDOMSharedInternals.p;
				ReactDOMSharedInternals.p = 2;
				var prevExecutionContext = executionContext;
				executionContext |= 4;
				try {
					commitLayoutEffectOnFiber(root, finishedWork.alternate, finishedWork);
				} finally {
					executionContext = prevExecutionContext, ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = rootHasLayoutEffect;
				}
			}
			pendingEffectsStatus = 3;
		}
	}
	function flushSpawnedWork() {
		if (4 === pendingEffectsStatus || 3 === pendingEffectsStatus) {
			pendingEffectsStatus = 0;
			requestPaint();
			var root = pendingEffectsRoot, finishedWork = pendingFinishedWork, lanes = pendingEffectsLanes, recoverableErrors = pendingRecoverableErrors;
			0 !== (finishedWork.subtreeFlags & 10256) || 0 !== (finishedWork.flags & 10256) ? pendingEffectsStatus = 5 : (pendingEffectsStatus = 0, pendingFinishedWork = pendingEffectsRoot = null, releaseRootPooledCache(root, root.pendingLanes));
			var remainingLanes = root.pendingLanes;
			0 === remainingLanes && (legacyErrorBoundariesThatAlreadyFailed = null);
			lanesToEventPriority(lanes);
			finishedWork = finishedWork.stateNode;
			if (injectedHook && "function" === typeof injectedHook.onCommitFiberRoot) try {
				injectedHook.onCommitFiberRoot(rendererID, finishedWork, void 0, 128 === (finishedWork.current.flags & 128));
			} catch (err) {}
			if (null !== recoverableErrors) {
				finishedWork = ReactSharedInternals.T;
				remainingLanes = ReactDOMSharedInternals.p;
				ReactDOMSharedInternals.p = 2;
				ReactSharedInternals.T = null;
				try {
					for (var onRecoverableError = root.onRecoverableError, i = 0; i < recoverableErrors.length; i++) {
						var recoverableError = recoverableErrors[i];
						onRecoverableError(recoverableError.value, { componentStack: recoverableError.stack });
					}
				} finally {
					ReactSharedInternals.T = finishedWork, ReactDOMSharedInternals.p = remainingLanes;
				}
			}
			0 !== (pendingEffectsLanes & 3) && flushPendingEffects();
			ensureRootIsScheduled(root);
			remainingLanes = root.pendingLanes;
			0 !== (lanes & 261930) && 0 !== (remainingLanes & 42) ? root === rootWithNestedUpdates ? nestedUpdateCount++ : (nestedUpdateCount = 0, rootWithNestedUpdates = root) : nestedUpdateCount = 0;
			flushSyncWorkAcrossRoots_impl(0, !1);
		}
	}
	function releaseRootPooledCache(root, remainingLanes) {
		0 === (root.pooledCacheLanes &= remainingLanes) && (remainingLanes = root.pooledCache, null != remainingLanes && (root.pooledCache = null, releaseCache(remainingLanes)));
	}
	function flushPendingEffects() {
		flushMutationEffects();
		flushLayoutEffects();
		flushSpawnedWork();
		return flushPassiveEffects();
	}
	function flushPassiveEffects() {
		if (5 !== pendingEffectsStatus) return !1;
		var root = pendingEffectsRoot, remainingLanes = pendingEffectsRemainingLanes;
		pendingEffectsRemainingLanes = 0;
		var renderPriority = lanesToEventPriority(pendingEffectsLanes), prevTransition = ReactSharedInternals.T, previousPriority = ReactDOMSharedInternals.p;
		try {
			ReactDOMSharedInternals.p = 32 > renderPriority ? 32 : renderPriority;
			ReactSharedInternals.T = null;
			renderPriority = pendingPassiveTransitions;
			pendingPassiveTransitions = null;
			var root$jscomp$0 = pendingEffectsRoot, lanes = pendingEffectsLanes;
			pendingEffectsStatus = 0;
			pendingFinishedWork = pendingEffectsRoot = null;
			pendingEffectsLanes = 0;
			if (0 !== (executionContext & 6)) throw Error(formatProdErrorMessage(331));
			var prevExecutionContext = executionContext;
			executionContext |= 4;
			commitPassiveUnmountOnFiber(root$jscomp$0.current);
			commitPassiveMountOnFiber(root$jscomp$0, root$jscomp$0.current, lanes, renderPriority);
			executionContext = prevExecutionContext;
			flushSyncWorkAcrossRoots_impl(0, !1);
			if (injectedHook && "function" === typeof injectedHook.onPostCommitFiberRoot) try {
				injectedHook.onPostCommitFiberRoot(rendererID, root$jscomp$0);
			} catch (err) {}
			return !0;
		} finally {
			ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = prevTransition, releaseRootPooledCache(root, remainingLanes);
		}
	}
	function captureCommitPhaseErrorOnRoot(rootFiber, sourceFiber, error) {
		sourceFiber = createCapturedValueAtFiber(error, sourceFiber);
		sourceFiber = createRootErrorUpdate(rootFiber.stateNode, sourceFiber, 2);
		rootFiber = enqueueUpdate(rootFiber, sourceFiber, 2);
		null !== rootFiber && (markRootUpdated$1(rootFiber, 2), ensureRootIsScheduled(rootFiber));
	}
	function captureCommitPhaseError(sourceFiber, nearestMountedAncestor, error) {
		if (3 === sourceFiber.tag) captureCommitPhaseErrorOnRoot(sourceFiber, sourceFiber, error);
		else for (; null !== nearestMountedAncestor;) {
			if (3 === nearestMountedAncestor.tag) {
				captureCommitPhaseErrorOnRoot(nearestMountedAncestor, sourceFiber, error);
				break;
			} else if (1 === nearestMountedAncestor.tag) {
				var instance = nearestMountedAncestor.stateNode;
				if ("function" === typeof nearestMountedAncestor.type.getDerivedStateFromError || "function" === typeof instance.componentDidCatch && (null === legacyErrorBoundariesThatAlreadyFailed || !legacyErrorBoundariesThatAlreadyFailed.has(instance))) {
					sourceFiber = createCapturedValueAtFiber(error, sourceFiber);
					error = createClassErrorUpdate(2);
					instance = enqueueUpdate(nearestMountedAncestor, error, 2);
					null !== instance && (initializeClassErrorUpdate(error, instance, nearestMountedAncestor, sourceFiber), markRootUpdated$1(instance, 2), ensureRootIsScheduled(instance));
					break;
				}
			}
			nearestMountedAncestor = nearestMountedAncestor.return;
		}
	}
	function attachPingListener(root, wakeable, lanes) {
		var pingCache = root.pingCache;
		if (null === pingCache) {
			pingCache = root.pingCache = new PossiblyWeakMap();
			var threadIDs = /* @__PURE__ */ new Set();
			pingCache.set(wakeable, threadIDs);
		} else threadIDs = pingCache.get(wakeable), void 0 === threadIDs && (threadIDs = /* @__PURE__ */ new Set(), pingCache.set(wakeable, threadIDs));
		threadIDs.has(lanes) || (workInProgressRootDidAttachPingListener = !0, threadIDs.add(lanes), root = pingSuspendedRoot.bind(null, root, wakeable, lanes), wakeable.then(root, root));
	}
	function pingSuspendedRoot(root, wakeable, pingedLanes) {
		var pingCache = root.pingCache;
		null !== pingCache && pingCache.delete(wakeable);
		root.pingedLanes |= root.suspendedLanes & pingedLanes;
		root.warmLanes &= ~pingedLanes;
		workInProgressRoot === root && (workInProgressRootRenderLanes & pingedLanes) === pingedLanes && (4 === workInProgressRootExitStatus || 3 === workInProgressRootExitStatus && (workInProgressRootRenderLanes & 62914560) === workInProgressRootRenderLanes && 300 > now() - globalMostRecentFallbackTime ? 0 === (executionContext & 2) && prepareFreshStack(root, 0) : workInProgressRootPingedLanes |= pingedLanes, workInProgressSuspendedRetryLanes === workInProgressRootRenderLanes && (workInProgressSuspendedRetryLanes = 0));
		ensureRootIsScheduled(root);
	}
	function retryTimedOutBoundary(boundaryFiber, retryLane) {
		0 === retryLane && (retryLane = claimNextRetryLane());
		boundaryFiber = enqueueConcurrentRenderForLane(boundaryFiber, retryLane);
		null !== boundaryFiber && (markRootUpdated$1(boundaryFiber, retryLane), ensureRootIsScheduled(boundaryFiber));
	}
	function retryDehydratedSuspenseBoundary(boundaryFiber) {
		var suspenseState = boundaryFiber.memoizedState, retryLane = 0;
		null !== suspenseState && (retryLane = suspenseState.retryLane);
		retryTimedOutBoundary(boundaryFiber, retryLane);
	}
	function resolveRetryWakeable(boundaryFiber, wakeable) {
		var retryLane = 0;
		switch (boundaryFiber.tag) {
			case 31:
			case 13:
				var retryCache = boundaryFiber.stateNode;
				var suspenseState = boundaryFiber.memoizedState;
				null !== suspenseState && (retryLane = suspenseState.retryLane);
				break;
			case 19:
				retryCache = boundaryFiber.stateNode;
				break;
			case 22:
				retryCache = boundaryFiber.stateNode._retryCache;
				break;
			default: throw Error(formatProdErrorMessage(314));
		}
		null !== retryCache && retryCache.delete(wakeable);
		retryTimedOutBoundary(boundaryFiber, retryLane);
	}
	function scheduleCallback$1(priorityLevel, callback) {
		return scheduleCallback$3(priorityLevel, callback);
	}
	var firstScheduledRoot = null, lastScheduledRoot = null, didScheduleMicrotask = !1, mightHavePendingSyncWork = !1, isFlushingWork = !1, currentEventTransitionLane = 0;
	function ensureRootIsScheduled(root) {
		root !== lastScheduledRoot && null === root.next && (null === lastScheduledRoot ? firstScheduledRoot = lastScheduledRoot = root : lastScheduledRoot = lastScheduledRoot.next = root);
		mightHavePendingSyncWork = !0;
		didScheduleMicrotask || (didScheduleMicrotask = !0, scheduleImmediateRootScheduleTask());
	}
	function flushSyncWorkAcrossRoots_impl(syncTransitionLanes, onlyLegacy) {
		if (!isFlushingWork && mightHavePendingSyncWork) {
			isFlushingWork = !0;
			do {
				var didPerformSomeWork = !1;
				for (var root$170 = firstScheduledRoot; null !== root$170;) {
					if (!onlyLegacy) if (0 !== syncTransitionLanes) {
						var pendingLanes = root$170.pendingLanes;
						if (0 === pendingLanes) var JSCompiler_inline_result = 0;
						else {
							var suspendedLanes = root$170.suspendedLanes, pingedLanes = root$170.pingedLanes;
							JSCompiler_inline_result = (1 << 31 - clz32(42 | syncTransitionLanes) + 1) - 1;
							JSCompiler_inline_result &= pendingLanes & ~(suspendedLanes & ~pingedLanes);
							JSCompiler_inline_result = JSCompiler_inline_result & 201326741 ? JSCompiler_inline_result & 201326741 | 1 : JSCompiler_inline_result ? JSCompiler_inline_result | 2 : 0;
						}
						0 !== JSCompiler_inline_result && (didPerformSomeWork = !0, performSyncWorkOnRoot(root$170, JSCompiler_inline_result));
					} else JSCompiler_inline_result = workInProgressRootRenderLanes, JSCompiler_inline_result = getNextLanes(root$170, root$170 === workInProgressRoot ? JSCompiler_inline_result : 0, null !== root$170.cancelPendingCommit || -1 !== root$170.timeoutHandle), 0 === (JSCompiler_inline_result & 3) || checkIfRootIsPrerendering(root$170, JSCompiler_inline_result) || (didPerformSomeWork = !0, performSyncWorkOnRoot(root$170, JSCompiler_inline_result));
					root$170 = root$170.next;
				}
			} while (didPerformSomeWork);
			isFlushingWork = !1;
		}
	}
	function processRootScheduleInImmediateTask() {
		processRootScheduleInMicrotask();
	}
	function processRootScheduleInMicrotask() {
		mightHavePendingSyncWork = didScheduleMicrotask = !1;
		var syncTransitionLanes = 0;
		0 !== currentEventTransitionLane && shouldAttemptEagerTransition() && (syncTransitionLanes = currentEventTransitionLane);
		for (var currentTime = now(), prev = null, root = firstScheduledRoot; null !== root;) {
			var next = root.next, nextLanes = scheduleTaskForRootDuringMicrotask(root, currentTime);
			if (0 === nextLanes) root.next = null, null === prev ? firstScheduledRoot = next : prev.next = next, null === next && (lastScheduledRoot = prev);
			else if (prev = root, 0 !== syncTransitionLanes || 0 !== (nextLanes & 3)) mightHavePendingSyncWork = !0;
			root = next;
		}
		0 !== pendingEffectsStatus && 5 !== pendingEffectsStatus || flushSyncWorkAcrossRoots_impl(syncTransitionLanes, !1);
		0 !== currentEventTransitionLane && (currentEventTransitionLane = 0);
	}
	function scheduleTaskForRootDuringMicrotask(root, currentTime) {
		for (var suspendedLanes = root.suspendedLanes, pingedLanes = root.pingedLanes, expirationTimes = root.expirationTimes, lanes = root.pendingLanes & -62914561; 0 < lanes;) {
			var index$5 = 31 - clz32(lanes), lane = 1 << index$5, expirationTime = expirationTimes[index$5];
			if (-1 === expirationTime) {
				if (0 === (lane & suspendedLanes) || 0 !== (lane & pingedLanes)) expirationTimes[index$5] = computeExpirationTime(lane, currentTime);
			} else expirationTime <= currentTime && (root.expiredLanes |= lane);
			lanes &= ~lane;
		}
		currentTime = workInProgressRoot;
		suspendedLanes = workInProgressRootRenderLanes;
		suspendedLanes = getNextLanes(root, root === currentTime ? suspendedLanes : 0, null !== root.cancelPendingCommit || -1 !== root.timeoutHandle);
		pingedLanes = root.callbackNode;
		if (0 === suspendedLanes || root === currentTime && (2 === workInProgressSuspendedReason || 9 === workInProgressSuspendedReason) || null !== root.cancelPendingCommit) return null !== pingedLanes && null !== pingedLanes && cancelCallback$1(pingedLanes), root.callbackNode = null, root.callbackPriority = 0;
		if (0 === (suspendedLanes & 3) || checkIfRootIsPrerendering(root, suspendedLanes)) {
			currentTime = suspendedLanes & -suspendedLanes;
			if (currentTime === root.callbackPriority) return currentTime;
			null !== pingedLanes && cancelCallback$1(pingedLanes);
			switch (lanesToEventPriority(suspendedLanes)) {
				case 2:
				case 8:
					suspendedLanes = UserBlockingPriority;
					break;
				case 32:
					suspendedLanes = NormalPriority$1;
					break;
				case 268435456:
					suspendedLanes = IdlePriority;
					break;
				default: suspendedLanes = NormalPriority$1;
			}
			pingedLanes = performWorkOnRootViaSchedulerTask.bind(null, root);
			suspendedLanes = scheduleCallback$3(suspendedLanes, pingedLanes);
			root.callbackPriority = currentTime;
			root.callbackNode = suspendedLanes;
			return currentTime;
		}
		null !== pingedLanes && null !== pingedLanes && cancelCallback$1(pingedLanes);
		root.callbackPriority = 2;
		root.callbackNode = null;
		return 2;
	}
	function performWorkOnRootViaSchedulerTask(root, didTimeout) {
		if (0 !== pendingEffectsStatus && 5 !== pendingEffectsStatus) return root.callbackNode = null, root.callbackPriority = 0, null;
		var originalCallbackNode = root.callbackNode;
		if (flushPendingEffects() && root.callbackNode !== originalCallbackNode) return null;
		var workInProgressRootRenderLanes$jscomp$0 = workInProgressRootRenderLanes;
		workInProgressRootRenderLanes$jscomp$0 = getNextLanes(root, root === workInProgressRoot ? workInProgressRootRenderLanes$jscomp$0 : 0, null !== root.cancelPendingCommit || -1 !== root.timeoutHandle);
		if (0 === workInProgressRootRenderLanes$jscomp$0) return null;
		performWorkOnRoot(root, workInProgressRootRenderLanes$jscomp$0, didTimeout);
		scheduleTaskForRootDuringMicrotask(root, now());
		return null != root.callbackNode && root.callbackNode === originalCallbackNode ? performWorkOnRootViaSchedulerTask.bind(null, root) : null;
	}
	function performSyncWorkOnRoot(root, lanes) {
		if (flushPendingEffects()) return null;
		performWorkOnRoot(root, lanes, !0);
	}
	function scheduleImmediateRootScheduleTask() {
		scheduleMicrotask(function() {
			0 !== (executionContext & 6) ? scheduleCallback$3(ImmediatePriority, processRootScheduleInImmediateTask) : processRootScheduleInMicrotask();
		});
	}
	function requestTransitionLane() {
		if (0 === currentEventTransitionLane) {
			var actionScopeLane = currentEntangledLane;
			0 === actionScopeLane && (actionScopeLane = nextTransitionUpdateLane, nextTransitionUpdateLane <<= 1, 0 === (nextTransitionUpdateLane & 261888) && (nextTransitionUpdateLane = 256));
			currentEventTransitionLane = actionScopeLane;
		}
		return currentEventTransitionLane;
	}
	function coerceFormActionProp(actionProp) {
		return null == actionProp || "symbol" === typeof actionProp || "boolean" === typeof actionProp ? null : "function" === typeof actionProp ? actionProp : sanitizeURL("" + actionProp);
	}
	function createFormDataWithSubmitter(form, submitter) {
		var temp = submitter.ownerDocument.createElement("input");
		temp.name = submitter.name;
		temp.value = submitter.value;
		form.id && temp.setAttribute("form", form.id);
		submitter.parentNode.insertBefore(temp, submitter);
		form = new FormData(form);
		temp.parentNode.removeChild(temp);
		return form;
	}
	function extractEvents$1(dispatchQueue, domEventName, maybeTargetInst, nativeEvent, nativeEventTarget) {
		if ("submit" === domEventName && maybeTargetInst && maybeTargetInst.stateNode === nativeEventTarget) {
			var action = coerceFormActionProp((nativeEventTarget[internalPropsKey] || null).action), submitter = nativeEvent.submitter;
			submitter && (domEventName = (domEventName = submitter[internalPropsKey] || null) ? coerceFormActionProp(domEventName.formAction) : submitter.getAttribute("formAction"), null !== domEventName && (action = domEventName, submitter = null));
			var event = new SyntheticEvent("action", "action", null, nativeEvent, nativeEventTarget);
			dispatchQueue.push({
				event,
				listeners: [{
					instance: null,
					listener: function() {
						if (nativeEvent.defaultPrevented) {
							if (0 !== currentEventTransitionLane) {
								var formData = submitter ? createFormDataWithSubmitter(nativeEventTarget, submitter) : new FormData(nativeEventTarget);
								startHostTransition(maybeTargetInst, {
									pending: !0,
									data: formData,
									method: nativeEventTarget.method,
									action
								}, null, formData);
							}
						} else "function" === typeof action && (event.preventDefault(), formData = submitter ? createFormDataWithSubmitter(nativeEventTarget, submitter) : new FormData(nativeEventTarget), startHostTransition(maybeTargetInst, {
							pending: !0,
							data: formData,
							method: nativeEventTarget.method,
							action
						}, action, formData));
					},
					currentTarget: nativeEventTarget
				}]
			});
		}
	}
	for (var i$jscomp$inline_1577 = 0; i$jscomp$inline_1577 < simpleEventPluginEvents.length; i$jscomp$inline_1577++) {
		var eventName$jscomp$inline_1578 = simpleEventPluginEvents[i$jscomp$inline_1577];
		registerSimpleEvent(eventName$jscomp$inline_1578.toLowerCase(), "on" + (eventName$jscomp$inline_1578[0].toUpperCase() + eventName$jscomp$inline_1578.slice(1)));
	}
	registerSimpleEvent(ANIMATION_END, "onAnimationEnd");
	registerSimpleEvent(ANIMATION_ITERATION, "onAnimationIteration");
	registerSimpleEvent(ANIMATION_START, "onAnimationStart");
	registerSimpleEvent("dblclick", "onDoubleClick");
	registerSimpleEvent("focusin", "onFocus");
	registerSimpleEvent("focusout", "onBlur");
	registerSimpleEvent(TRANSITION_RUN, "onTransitionRun");
	registerSimpleEvent(TRANSITION_START, "onTransitionStart");
	registerSimpleEvent(TRANSITION_CANCEL, "onTransitionCancel");
	registerSimpleEvent(TRANSITION_END, "onTransitionEnd");
	registerDirectEvent("onMouseEnter", ["mouseout", "mouseover"]);
	registerDirectEvent("onMouseLeave", ["mouseout", "mouseover"]);
	registerDirectEvent("onPointerEnter", ["pointerout", "pointerover"]);
	registerDirectEvent("onPointerLeave", ["pointerout", "pointerover"]);
	registerTwoPhaseEvent("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" "));
	registerTwoPhaseEvent("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));
	registerTwoPhaseEvent("onBeforeInput", [
		"compositionend",
		"keypress",
		"textInput",
		"paste"
	]);
	registerTwoPhaseEvent("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" "));
	registerTwoPhaseEvent("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" "));
	registerTwoPhaseEvent("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
	var mediaEventTypes = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), nonDelegatedEvents = new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(mediaEventTypes));
	function processDispatchQueue(dispatchQueue, eventSystemFlags) {
		eventSystemFlags = 0 !== (eventSystemFlags & 4);
		for (var i = 0; i < dispatchQueue.length; i++) {
			var _dispatchQueue$i = dispatchQueue[i], event = _dispatchQueue$i.event;
			_dispatchQueue$i = _dispatchQueue$i.listeners;
			a: {
				var previousInstance = void 0;
				if (eventSystemFlags) for (var i$jscomp$0 = _dispatchQueue$i.length - 1; 0 <= i$jscomp$0; i$jscomp$0--) {
					var _dispatchListeners$i = _dispatchQueue$i[i$jscomp$0], instance = _dispatchListeners$i.instance, currentTarget = _dispatchListeners$i.currentTarget;
					_dispatchListeners$i = _dispatchListeners$i.listener;
					if (instance !== previousInstance && event.isPropagationStopped()) break a;
					previousInstance = _dispatchListeners$i;
					event.currentTarget = currentTarget;
					try {
						previousInstance(event);
					} catch (error) {
						reportGlobalError(error);
					}
					event.currentTarget = null;
					previousInstance = instance;
				}
				else for (i$jscomp$0 = 0; i$jscomp$0 < _dispatchQueue$i.length; i$jscomp$0++) {
					_dispatchListeners$i = _dispatchQueue$i[i$jscomp$0];
					instance = _dispatchListeners$i.instance;
					currentTarget = _dispatchListeners$i.currentTarget;
					_dispatchListeners$i = _dispatchListeners$i.listener;
					if (instance !== previousInstance && event.isPropagationStopped()) break a;
					previousInstance = _dispatchListeners$i;
					event.currentTarget = currentTarget;
					try {
						previousInstance(event);
					} catch (error) {
						reportGlobalError(error);
					}
					event.currentTarget = null;
					previousInstance = instance;
				}
			}
		}
	}
	function listenToNonDelegatedEvent(domEventName, targetElement) {
		var JSCompiler_inline_result = targetElement[internalEventHandlersKey];
		void 0 === JSCompiler_inline_result && (JSCompiler_inline_result = targetElement[internalEventHandlersKey] = /* @__PURE__ */ new Set());
		var listenerSetKey = domEventName + "__bubble";
		JSCompiler_inline_result.has(listenerSetKey) || (addTrappedEventListener(targetElement, domEventName, 2, !1), JSCompiler_inline_result.add(listenerSetKey));
	}
	function listenToNativeEvent(domEventName, isCapturePhaseListener, target) {
		var eventSystemFlags = 0;
		isCapturePhaseListener && (eventSystemFlags |= 4);
		addTrappedEventListener(target, domEventName, eventSystemFlags, isCapturePhaseListener);
	}
	var listeningMarker = "_reactListening" + Math.random().toString(36).slice(2);
	function listenToAllSupportedEvents(rootContainerElement) {
		if (!rootContainerElement[listeningMarker]) {
			rootContainerElement[listeningMarker] = !0;
			allNativeEvents.forEach(function(domEventName) {
				"selectionchange" !== domEventName && (nonDelegatedEvents.has(domEventName) || listenToNativeEvent(domEventName, !1, rootContainerElement), listenToNativeEvent(domEventName, !0, rootContainerElement));
			});
			var ownerDocument = 9 === rootContainerElement.nodeType ? rootContainerElement : rootContainerElement.ownerDocument;
			null === ownerDocument || ownerDocument[listeningMarker] || (ownerDocument[listeningMarker] = !0, listenToNativeEvent("selectionchange", !1, ownerDocument));
		}
	}
	function addTrappedEventListener(targetContainer, domEventName, eventSystemFlags, isCapturePhaseListener) {
		switch (getEventPriority(domEventName)) {
			case 2:
				var listenerWrapper = dispatchDiscreteEvent;
				break;
			case 8:
				listenerWrapper = dispatchContinuousEvent;
				break;
			default: listenerWrapper = dispatchEvent;
		}
		eventSystemFlags = listenerWrapper.bind(null, domEventName, eventSystemFlags, targetContainer);
		listenerWrapper = void 0;
		!passiveBrowserEventsSupported || "touchstart" !== domEventName && "touchmove" !== domEventName && "wheel" !== domEventName || (listenerWrapper = !0);
		isCapturePhaseListener ? void 0 !== listenerWrapper ? targetContainer.addEventListener(domEventName, eventSystemFlags, {
			capture: !0,
			passive: listenerWrapper
		}) : targetContainer.addEventListener(domEventName, eventSystemFlags, !0) : void 0 !== listenerWrapper ? targetContainer.addEventListener(domEventName, eventSystemFlags, { passive: listenerWrapper }) : targetContainer.addEventListener(domEventName, eventSystemFlags, !1);
	}
	function dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, targetInst$jscomp$0, targetContainer) {
		var ancestorInst = targetInst$jscomp$0;
		if (0 === (eventSystemFlags & 1) && 0 === (eventSystemFlags & 2) && null !== targetInst$jscomp$0) a: for (;;) {
			if (null === targetInst$jscomp$0) return;
			var nodeTag = targetInst$jscomp$0.tag;
			if (3 === nodeTag || 4 === nodeTag) {
				var container = targetInst$jscomp$0.stateNode.containerInfo;
				if (container === targetContainer) break;
				if (4 === nodeTag) for (nodeTag = targetInst$jscomp$0.return; null !== nodeTag;) {
					var grandTag = nodeTag.tag;
					if ((3 === grandTag || 4 === grandTag) && nodeTag.stateNode.containerInfo === targetContainer) return;
					nodeTag = nodeTag.return;
				}
				for (; null !== container;) {
					nodeTag = getClosestInstanceFromNode(container);
					if (null === nodeTag) return;
					grandTag = nodeTag.tag;
					if (5 === grandTag || 6 === grandTag || 26 === grandTag || 27 === grandTag) {
						targetInst$jscomp$0 = ancestorInst = nodeTag;
						continue a;
					}
					container = container.parentNode;
				}
			}
			targetInst$jscomp$0 = targetInst$jscomp$0.return;
		}
		batchedUpdates$1(function() {
			var targetInst = ancestorInst, nativeEventTarget = getEventTarget(nativeEvent), dispatchQueue = [];
			a: {
				var reactName = topLevelEventsToReactNames.get(domEventName);
				if (void 0 !== reactName) {
					var SyntheticEventCtor = SyntheticEvent, reactEventType = domEventName;
					switch (domEventName) {
						case "keypress": if (0 === getEventCharCode(nativeEvent)) break a;
						case "keydown":
						case "keyup":
							SyntheticEventCtor = SyntheticKeyboardEvent;
							break;
						case "focusin":
							reactEventType = "focus";
							SyntheticEventCtor = SyntheticFocusEvent;
							break;
						case "focusout":
							reactEventType = "blur";
							SyntheticEventCtor = SyntheticFocusEvent;
							break;
						case "beforeblur":
						case "afterblur":
							SyntheticEventCtor = SyntheticFocusEvent;
							break;
						case "click": if (2 === nativeEvent.button) break a;
						case "auxclick":
						case "dblclick":
						case "mousedown":
						case "mousemove":
						case "mouseup":
						case "mouseout":
						case "mouseover":
						case "contextmenu":
							SyntheticEventCtor = SyntheticMouseEvent;
							break;
						case "drag":
						case "dragend":
						case "dragenter":
						case "dragexit":
						case "dragleave":
						case "dragover":
						case "dragstart":
						case "drop":
							SyntheticEventCtor = SyntheticDragEvent;
							break;
						case "touchcancel":
						case "touchend":
						case "touchmove":
						case "touchstart":
							SyntheticEventCtor = SyntheticTouchEvent;
							break;
						case ANIMATION_END:
						case ANIMATION_ITERATION:
						case ANIMATION_START:
							SyntheticEventCtor = SyntheticAnimationEvent;
							break;
						case TRANSITION_END:
							SyntheticEventCtor = SyntheticTransitionEvent;
							break;
						case "scroll":
						case "scrollend":
							SyntheticEventCtor = SyntheticUIEvent;
							break;
						case "wheel":
							SyntheticEventCtor = SyntheticWheelEvent;
							break;
						case "copy":
						case "cut":
						case "paste":
							SyntheticEventCtor = SyntheticClipboardEvent;
							break;
						case "gotpointercapture":
						case "lostpointercapture":
						case "pointercancel":
						case "pointerdown":
						case "pointermove":
						case "pointerout":
						case "pointerover":
						case "pointerup":
							SyntheticEventCtor = SyntheticPointerEvent;
							break;
						case "toggle":
						case "beforetoggle": SyntheticEventCtor = SyntheticToggleEvent;
					}
					var inCapturePhase = 0 !== (eventSystemFlags & 4), accumulateTargetOnly = !inCapturePhase && ("scroll" === domEventName || "scrollend" === domEventName), reactEventName = inCapturePhase ? null !== reactName ? reactName + "Capture" : null : reactName;
					inCapturePhase = [];
					for (var instance = targetInst, lastHostComponent; null !== instance;) {
						var _instance = instance;
						lastHostComponent = _instance.stateNode;
						_instance = _instance.tag;
						5 !== _instance && 26 !== _instance && 27 !== _instance || null === lastHostComponent || null === reactEventName || (_instance = getListener(instance, reactEventName), null != _instance && inCapturePhase.push(createDispatchListener(instance, _instance, lastHostComponent)));
						if (accumulateTargetOnly) break;
						instance = instance.return;
					}
					0 < inCapturePhase.length && (reactName = new SyntheticEventCtor(reactName, reactEventType, null, nativeEvent, nativeEventTarget), dispatchQueue.push({
						event: reactName,
						listeners: inCapturePhase
					}));
				}
			}
			if (0 === (eventSystemFlags & 7)) {
				a: {
					reactName = "mouseover" === domEventName || "pointerover" === domEventName;
					SyntheticEventCtor = "mouseout" === domEventName || "pointerout" === domEventName;
					if (reactName && nativeEvent !== currentReplayingEvent && (reactEventType = nativeEvent.relatedTarget || nativeEvent.fromElement) && (getClosestInstanceFromNode(reactEventType) || reactEventType[internalContainerInstanceKey])) break a;
					if (SyntheticEventCtor || reactName) {
						reactName = nativeEventTarget.window === nativeEventTarget ? nativeEventTarget : (reactName = nativeEventTarget.ownerDocument) ? reactName.defaultView || reactName.parentWindow : window;
						if (SyntheticEventCtor) {
							if (reactEventType = nativeEvent.relatedTarget || nativeEvent.toElement, SyntheticEventCtor = targetInst, reactEventType = reactEventType ? getClosestInstanceFromNode(reactEventType) : null, null !== reactEventType && (accumulateTargetOnly = getNearestMountedFiber(reactEventType), inCapturePhase = reactEventType.tag, reactEventType !== accumulateTargetOnly || 5 !== inCapturePhase && 27 !== inCapturePhase && 6 !== inCapturePhase)) reactEventType = null;
						} else SyntheticEventCtor = null, reactEventType = targetInst;
						if (SyntheticEventCtor !== reactEventType) {
							inCapturePhase = SyntheticMouseEvent;
							_instance = "onMouseLeave";
							reactEventName = "onMouseEnter";
							instance = "mouse";
							if ("pointerout" === domEventName || "pointerover" === domEventName) inCapturePhase = SyntheticPointerEvent, _instance = "onPointerLeave", reactEventName = "onPointerEnter", instance = "pointer";
							accumulateTargetOnly = null == SyntheticEventCtor ? reactName : getNodeFromInstance(SyntheticEventCtor);
							lastHostComponent = null == reactEventType ? reactName : getNodeFromInstance(reactEventType);
							reactName = new inCapturePhase(_instance, instance + "leave", SyntheticEventCtor, nativeEvent, nativeEventTarget);
							reactName.target = accumulateTargetOnly;
							reactName.relatedTarget = lastHostComponent;
							_instance = null;
							getClosestInstanceFromNode(nativeEventTarget) === targetInst && (inCapturePhase = new inCapturePhase(reactEventName, instance + "enter", reactEventType, nativeEvent, nativeEventTarget), inCapturePhase.target = lastHostComponent, inCapturePhase.relatedTarget = accumulateTargetOnly, _instance = inCapturePhase);
							accumulateTargetOnly = _instance;
							if (SyntheticEventCtor && reactEventType) b: {
								inCapturePhase = getParent;
								reactEventName = SyntheticEventCtor;
								instance = reactEventType;
								lastHostComponent = 0;
								for (_instance = reactEventName; _instance; _instance = inCapturePhase(_instance)) lastHostComponent++;
								_instance = 0;
								for (var tempB = instance; tempB; tempB = inCapturePhase(tempB)) _instance++;
								for (; 0 < lastHostComponent - _instance;) reactEventName = inCapturePhase(reactEventName), lastHostComponent--;
								for (; 0 < _instance - lastHostComponent;) instance = inCapturePhase(instance), _instance--;
								for (; lastHostComponent--;) {
									if (reactEventName === instance || null !== instance && reactEventName === instance.alternate) {
										inCapturePhase = reactEventName;
										break b;
									}
									reactEventName = inCapturePhase(reactEventName);
									instance = inCapturePhase(instance);
								}
								inCapturePhase = null;
							}
							else inCapturePhase = null;
							null !== SyntheticEventCtor && accumulateEnterLeaveListenersForEvent(dispatchQueue, reactName, SyntheticEventCtor, inCapturePhase, !1);
							null !== reactEventType && null !== accumulateTargetOnly && accumulateEnterLeaveListenersForEvent(dispatchQueue, accumulateTargetOnly, reactEventType, inCapturePhase, !0);
						}
					}
				}
				a: {
					reactName = targetInst ? getNodeFromInstance(targetInst) : window;
					SyntheticEventCtor = reactName.nodeName && reactName.nodeName.toLowerCase();
					if ("select" === SyntheticEventCtor || "input" === SyntheticEventCtor && "file" === reactName.type) var getTargetInstFunc = getTargetInstForChangeEvent;
					else if (isTextInputElement(reactName)) if (isInputEventSupported) getTargetInstFunc = getTargetInstForInputOrChangeEvent;
					else {
						getTargetInstFunc = getTargetInstForInputEventPolyfill;
						var handleEventFunc = handleEventsForInputEventPolyfill;
					}
					else SyntheticEventCtor = reactName.nodeName, !SyntheticEventCtor || "input" !== SyntheticEventCtor.toLowerCase() || "checkbox" !== reactName.type && "radio" !== reactName.type ? targetInst && isCustomElement(targetInst.elementType) && (getTargetInstFunc = getTargetInstForChangeEvent) : getTargetInstFunc = getTargetInstForClickEvent;
					if (getTargetInstFunc && (getTargetInstFunc = getTargetInstFunc(domEventName, targetInst))) {
						createAndAccumulateChangeEvent(dispatchQueue, getTargetInstFunc, nativeEvent, nativeEventTarget);
						break a;
					}
					handleEventFunc && handleEventFunc(domEventName, reactName, targetInst);
					"focusout" === domEventName && targetInst && "number" === reactName.type && null != targetInst.memoizedProps.value && setDefaultValue(reactName, "number", reactName.value);
				}
				handleEventFunc = targetInst ? getNodeFromInstance(targetInst) : window;
				switch (domEventName) {
					case "focusin":
						if (isTextInputElement(handleEventFunc) || "true" === handleEventFunc.contentEditable) activeElement = handleEventFunc, activeElementInst = targetInst, lastSelection = null;
						break;
					case "focusout":
						lastSelection = activeElementInst = activeElement = null;
						break;
					case "mousedown":
						mouseDown = !0;
						break;
					case "contextmenu":
					case "mouseup":
					case "dragend":
						mouseDown = !1;
						constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget);
						break;
					case "selectionchange": if (skipSelectionChangeEvent) break;
					case "keydown":
					case "keyup": constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget);
				}
				var fallbackData;
				if (canUseCompositionEvent) b: {
					switch (domEventName) {
						case "compositionstart":
							var eventType = "onCompositionStart";
							break b;
						case "compositionend":
							eventType = "onCompositionEnd";
							break b;
						case "compositionupdate":
							eventType = "onCompositionUpdate";
							break b;
					}
					eventType = void 0;
				}
				else isComposing ? isFallbackCompositionEnd(domEventName, nativeEvent) && (eventType = "onCompositionEnd") : "keydown" === domEventName && 229 === nativeEvent.keyCode && (eventType = "onCompositionStart");
				eventType && (useFallbackCompositionData && "ko" !== nativeEvent.locale && (isComposing || "onCompositionStart" !== eventType ? "onCompositionEnd" === eventType && isComposing && (fallbackData = getData()) : (root = nativeEventTarget, startText = "value" in root ? root.value : root.textContent, isComposing = !0)), handleEventFunc = accumulateTwoPhaseListeners(targetInst, eventType), 0 < handleEventFunc.length && (eventType = new SyntheticCompositionEvent(eventType, domEventName, null, nativeEvent, nativeEventTarget), dispatchQueue.push({
					event: eventType,
					listeners: handleEventFunc
				}), fallbackData ? eventType.data = fallbackData : (fallbackData = getDataFromCustomEvent(nativeEvent), null !== fallbackData && (eventType.data = fallbackData))));
				if (fallbackData = canUseTextInputEvent ? getNativeBeforeInputChars(domEventName, nativeEvent) : getFallbackBeforeInputChars(domEventName, nativeEvent)) eventType = accumulateTwoPhaseListeners(targetInst, "onBeforeInput"), 0 < eventType.length && (handleEventFunc = new SyntheticCompositionEvent("onBeforeInput", "beforeinput", null, nativeEvent, nativeEventTarget), dispatchQueue.push({
					event: handleEventFunc,
					listeners: eventType
				}), handleEventFunc.data = fallbackData);
				extractEvents$1(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget);
			}
			processDispatchQueue(dispatchQueue, eventSystemFlags);
		});
	}
	function createDispatchListener(instance, listener, currentTarget) {
		return {
			instance,
			listener,
			currentTarget
		};
	}
	function accumulateTwoPhaseListeners(targetFiber, reactName) {
		for (var captureName = reactName + "Capture", listeners = []; null !== targetFiber;) {
			var _instance2 = targetFiber, stateNode = _instance2.stateNode;
			_instance2 = _instance2.tag;
			5 !== _instance2 && 26 !== _instance2 && 27 !== _instance2 || null === stateNode || (_instance2 = getListener(targetFiber, captureName), null != _instance2 && listeners.unshift(createDispatchListener(targetFiber, _instance2, stateNode)), _instance2 = getListener(targetFiber, reactName), null != _instance2 && listeners.push(createDispatchListener(targetFiber, _instance2, stateNode)));
			if (3 === targetFiber.tag) return listeners;
			targetFiber = targetFiber.return;
		}
		return [];
	}
	function getParent(inst) {
		if (null === inst) return null;
		do
			inst = inst.return;
		while (inst && 5 !== inst.tag && 27 !== inst.tag);
		return inst ? inst : null;
	}
	function accumulateEnterLeaveListenersForEvent(dispatchQueue, event, target, common, inCapturePhase) {
		for (var registrationName = event._reactName, listeners = []; null !== target && target !== common;) {
			var _instance3 = target, alternate = _instance3.alternate, stateNode = _instance3.stateNode;
			_instance3 = _instance3.tag;
			if (null !== alternate && alternate === common) break;
			5 !== _instance3 && 26 !== _instance3 && 27 !== _instance3 || null === stateNode || (alternate = stateNode, inCapturePhase ? (stateNode = getListener(target, registrationName), null != stateNode && listeners.unshift(createDispatchListener(target, stateNode, alternate))) : inCapturePhase || (stateNode = getListener(target, registrationName), null != stateNode && listeners.push(createDispatchListener(target, stateNode, alternate))));
			target = target.return;
		}
		0 !== listeners.length && dispatchQueue.push({
			event,
			listeners
		});
	}
	var NORMALIZE_NEWLINES_REGEX = /\r\n?/g, NORMALIZE_NULL_AND_REPLACEMENT_REGEX = /\u0000|\uFFFD/g;
	function normalizeMarkupForTextOrAttribute(markup) {
		return ("string" === typeof markup ? markup : "" + markup).replace(NORMALIZE_NEWLINES_REGEX, "\n").replace(NORMALIZE_NULL_AND_REPLACEMENT_REGEX, "");
	}
	function checkForUnmatchedText(serverText, clientText) {
		clientText = normalizeMarkupForTextOrAttribute(clientText);
		return normalizeMarkupForTextOrAttribute(serverText) === clientText ? !0 : !1;
	}
	function setProp(domElement, tag, key, value, props, prevValue) {
		switch (key) {
			case "children":
				"string" === typeof value ? "body" === tag || "textarea" === tag && "" === value || setTextContent(domElement, value) : ("number" === typeof value || "bigint" === typeof value) && "body" !== tag && setTextContent(domElement, "" + value);
				break;
			case "className":
				setValueForKnownAttribute(domElement, "class", value);
				break;
			case "tabIndex":
				setValueForKnownAttribute(domElement, "tabindex", value);
				break;
			case "dir":
			case "role":
			case "viewBox":
			case "width":
			case "height":
				setValueForKnownAttribute(domElement, key, value);
				break;
			case "style":
				setValueForStyles(domElement, value, prevValue);
				break;
			case "data": if ("object" !== tag) {
				setValueForKnownAttribute(domElement, "data", value);
				break;
			}
			case "src":
			case "href":
				if ("" === value && ("a" !== tag || "href" !== key)) {
					domElement.removeAttribute(key);
					break;
				}
				if (null == value || "function" === typeof value || "symbol" === typeof value || "boolean" === typeof value) {
					domElement.removeAttribute(key);
					break;
				}
				value = sanitizeURL("" + value);
				domElement.setAttribute(key, value);
				break;
			case "action":
			case "formAction":
				if ("function" === typeof value) {
					domElement.setAttribute(key, "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");
					break;
				} else "function" === typeof prevValue && ("formAction" === key ? ("input" !== tag && setProp(domElement, tag, "name", props.name, props, null), setProp(domElement, tag, "formEncType", props.formEncType, props, null), setProp(domElement, tag, "formMethod", props.formMethod, props, null), setProp(domElement, tag, "formTarget", props.formTarget, props, null)) : (setProp(domElement, tag, "encType", props.encType, props, null), setProp(domElement, tag, "method", props.method, props, null), setProp(domElement, tag, "target", props.target, props, null)));
				if (null == value || "symbol" === typeof value || "boolean" === typeof value) {
					domElement.removeAttribute(key);
					break;
				}
				value = sanitizeURL("" + value);
				domElement.setAttribute(key, value);
				break;
			case "onClick":
				null != value && (domElement.onclick = noop$1);
				break;
			case "onScroll":
				null != value && listenToNonDelegatedEvent("scroll", domElement);
				break;
			case "onScrollEnd":
				null != value && listenToNonDelegatedEvent("scrollend", domElement);
				break;
			case "dangerouslySetInnerHTML":
				if (null != value) {
					if ("object" !== typeof value || !("__html" in value)) throw Error(formatProdErrorMessage(61));
					key = value.__html;
					if (null != key) {
						if (null != props.children) throw Error(formatProdErrorMessage(60));
						domElement.innerHTML = key;
					}
				}
				break;
			case "multiple":
				domElement.multiple = value && "function" !== typeof value && "symbol" !== typeof value;
				break;
			case "muted":
				domElement.muted = value && "function" !== typeof value && "symbol" !== typeof value;
				break;
			case "suppressContentEditableWarning":
			case "suppressHydrationWarning":
			case "defaultValue":
			case "defaultChecked":
			case "innerHTML":
			case "ref": break;
			case "autoFocus": break;
			case "xlinkHref":
				if (null == value || "function" === typeof value || "boolean" === typeof value || "symbol" === typeof value) {
					domElement.removeAttribute("xlink:href");
					break;
				}
				key = sanitizeURL("" + value);
				domElement.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", key);
				break;
			case "contentEditable":
			case "spellCheck":
			case "draggable":
			case "value":
			case "autoReverse":
			case "externalResourcesRequired":
			case "focusable":
			case "preserveAlpha":
				null != value && "function" !== typeof value && "symbol" !== typeof value ? domElement.setAttribute(key, "" + value) : domElement.removeAttribute(key);
				break;
			case "inert":
			case "allowFullScreen":
			case "async":
			case "autoPlay":
			case "controls":
			case "default":
			case "defer":
			case "disabled":
			case "disablePictureInPicture":
			case "disableRemotePlayback":
			case "formNoValidate":
			case "hidden":
			case "loop":
			case "noModule":
			case "noValidate":
			case "open":
			case "playsInline":
			case "readOnly":
			case "required":
			case "reversed":
			case "scoped":
			case "seamless":
			case "itemScope":
				value && "function" !== typeof value && "symbol" !== typeof value ? domElement.setAttribute(key, "") : domElement.removeAttribute(key);
				break;
			case "capture":
			case "download":
				!0 === value ? domElement.setAttribute(key, "") : !1 !== value && null != value && "function" !== typeof value && "symbol" !== typeof value ? domElement.setAttribute(key, value) : domElement.removeAttribute(key);
				break;
			case "cols":
			case "rows":
			case "size":
			case "span":
				null != value && "function" !== typeof value && "symbol" !== typeof value && !isNaN(value) && 1 <= value ? domElement.setAttribute(key, value) : domElement.removeAttribute(key);
				break;
			case "rowSpan":
			case "start":
				null == value || "function" === typeof value || "symbol" === typeof value || isNaN(value) ? domElement.removeAttribute(key) : domElement.setAttribute(key, value);
				break;
			case "popover":
				listenToNonDelegatedEvent("beforetoggle", domElement);
				listenToNonDelegatedEvent("toggle", domElement);
				setValueForAttribute(domElement, "popover", value);
				break;
			case "xlinkActuate":
				setValueForNamespacedAttribute(domElement, "http://www.w3.org/1999/xlink", "xlink:actuate", value);
				break;
			case "xlinkArcrole":
				setValueForNamespacedAttribute(domElement, "http://www.w3.org/1999/xlink", "xlink:arcrole", value);
				break;
			case "xlinkRole":
				setValueForNamespacedAttribute(domElement, "http://www.w3.org/1999/xlink", "xlink:role", value);
				break;
			case "xlinkShow":
				setValueForNamespacedAttribute(domElement, "http://www.w3.org/1999/xlink", "xlink:show", value);
				break;
			case "xlinkTitle":
				setValueForNamespacedAttribute(domElement, "http://www.w3.org/1999/xlink", "xlink:title", value);
				break;
			case "xlinkType":
				setValueForNamespacedAttribute(domElement, "http://www.w3.org/1999/xlink", "xlink:type", value);
				break;
			case "xmlBase":
				setValueForNamespacedAttribute(domElement, "http://www.w3.org/XML/1998/namespace", "xml:base", value);
				break;
			case "xmlLang":
				setValueForNamespacedAttribute(domElement, "http://www.w3.org/XML/1998/namespace", "xml:lang", value);
				break;
			case "xmlSpace":
				setValueForNamespacedAttribute(domElement, "http://www.w3.org/XML/1998/namespace", "xml:space", value);
				break;
			case "is":
				setValueForAttribute(domElement, "is", value);
				break;
			case "innerText":
			case "textContent": break;
			default: if (!(2 < key.length) || "o" !== key[0] && "O" !== key[0] || "n" !== key[1] && "N" !== key[1]) key = aliases.get(key) || key, setValueForAttribute(domElement, key, value);
		}
	}
	function setPropOnCustomElement(domElement, tag, key, value, props, prevValue) {
		switch (key) {
			case "style":
				setValueForStyles(domElement, value, prevValue);
				break;
			case "dangerouslySetInnerHTML":
				if (null != value) {
					if ("object" !== typeof value || !("__html" in value)) throw Error(formatProdErrorMessage(61));
					key = value.__html;
					if (null != key) {
						if (null != props.children) throw Error(formatProdErrorMessage(60));
						domElement.innerHTML = key;
					}
				}
				break;
			case "children":
				"string" === typeof value ? setTextContent(domElement, value) : ("number" === typeof value || "bigint" === typeof value) && setTextContent(domElement, "" + value);
				break;
			case "onScroll":
				null != value && listenToNonDelegatedEvent("scroll", domElement);
				break;
			case "onScrollEnd":
				null != value && listenToNonDelegatedEvent("scrollend", domElement);
				break;
			case "onClick":
				null != value && (domElement.onclick = noop$1);
				break;
			case "suppressContentEditableWarning":
			case "suppressHydrationWarning":
			case "innerHTML":
			case "ref": break;
			case "innerText":
			case "textContent": break;
			default: if (!registrationNameDependencies.hasOwnProperty(key)) a: {
				if ("o" === key[0] && "n" === key[1] && (props = key.endsWith("Capture"), tag = key.slice(2, props ? key.length - 7 : void 0), prevValue = domElement[internalPropsKey] || null, prevValue = null != prevValue ? prevValue[key] : null, "function" === typeof prevValue && domElement.removeEventListener(tag, prevValue, props), "function" === typeof value)) {
					"function" !== typeof prevValue && null !== prevValue && (key in domElement ? domElement[key] = null : domElement.hasAttribute(key) && domElement.removeAttribute(key));
					domElement.addEventListener(tag, value, props);
					break a;
				}
				key in domElement ? domElement[key] = value : !0 === value ? domElement.setAttribute(key, "") : setValueForAttribute(domElement, key, value);
			}
		}
	}
	function setInitialProperties(domElement, tag, props) {
		switch (tag) {
			case "div":
			case "span":
			case "svg":
			case "path":
			case "a":
			case "g":
			case "p":
			case "li": break;
			case "img":
				listenToNonDelegatedEvent("error", domElement);
				listenToNonDelegatedEvent("load", domElement);
				var hasSrc = !1, hasSrcSet = !1, propKey;
				for (propKey in props) if (props.hasOwnProperty(propKey)) {
					var propValue = props[propKey];
					if (null != propValue) switch (propKey) {
						case "src":
							hasSrc = !0;
							break;
						case "srcSet":
							hasSrcSet = !0;
							break;
						case "children":
						case "dangerouslySetInnerHTML": throw Error(formatProdErrorMessage(137, tag));
						default: setProp(domElement, tag, propKey, propValue, props, null);
					}
				}
				hasSrcSet && setProp(domElement, tag, "srcSet", props.srcSet, props, null);
				hasSrc && setProp(domElement, tag, "src", props.src, props, null);
				return;
			case "input":
				listenToNonDelegatedEvent("invalid", domElement);
				var defaultValue = propKey = propValue = hasSrcSet = null, checked = null, defaultChecked = null;
				for (hasSrc in props) if (props.hasOwnProperty(hasSrc)) {
					var propValue$184 = props[hasSrc];
					if (null != propValue$184) switch (hasSrc) {
						case "name":
							hasSrcSet = propValue$184;
							break;
						case "type":
							propValue = propValue$184;
							break;
						case "checked":
							checked = propValue$184;
							break;
						case "defaultChecked":
							defaultChecked = propValue$184;
							break;
						case "value":
							propKey = propValue$184;
							break;
						case "defaultValue":
							defaultValue = propValue$184;
							break;
						case "children":
						case "dangerouslySetInnerHTML":
							if (null != propValue$184) throw Error(formatProdErrorMessage(137, tag));
							break;
						default: setProp(domElement, tag, hasSrc, propValue$184, props, null);
					}
				}
				initInput(domElement, propKey, defaultValue, checked, defaultChecked, propValue, hasSrcSet, !1);
				return;
			case "select":
				listenToNonDelegatedEvent("invalid", domElement);
				hasSrc = propValue = propKey = null;
				for (hasSrcSet in props) if (props.hasOwnProperty(hasSrcSet) && (defaultValue = props[hasSrcSet], null != defaultValue)) switch (hasSrcSet) {
					case "value":
						propKey = defaultValue;
						break;
					case "defaultValue":
						propValue = defaultValue;
						break;
					case "multiple": hasSrc = defaultValue;
					default: setProp(domElement, tag, hasSrcSet, defaultValue, props, null);
				}
				tag = propKey;
				props = propValue;
				domElement.multiple = !!hasSrc;
				null != tag ? updateOptions(domElement, !!hasSrc, tag, !1) : null != props && updateOptions(domElement, !!hasSrc, props, !0);
				return;
			case "textarea":
				listenToNonDelegatedEvent("invalid", domElement);
				propKey = hasSrcSet = hasSrc = null;
				for (propValue in props) if (props.hasOwnProperty(propValue) && (defaultValue = props[propValue], null != defaultValue)) switch (propValue) {
					case "value":
						hasSrc = defaultValue;
						break;
					case "defaultValue":
						hasSrcSet = defaultValue;
						break;
					case "children":
						propKey = defaultValue;
						break;
					case "dangerouslySetInnerHTML":
						if (null != defaultValue) throw Error(formatProdErrorMessage(91));
						break;
					default: setProp(domElement, tag, propValue, defaultValue, props, null);
				}
				initTextarea(domElement, hasSrc, hasSrcSet, propKey);
				return;
			case "option":
				for (checked in props) if (props.hasOwnProperty(checked) && (hasSrc = props[checked], null != hasSrc)) switch (checked) {
					case "selected":
						domElement.selected = hasSrc && "function" !== typeof hasSrc && "symbol" !== typeof hasSrc;
						break;
					default: setProp(domElement, tag, checked, hasSrc, props, null);
				}
				return;
			case "dialog":
				listenToNonDelegatedEvent("beforetoggle", domElement);
				listenToNonDelegatedEvent("toggle", domElement);
				listenToNonDelegatedEvent("cancel", domElement);
				listenToNonDelegatedEvent("close", domElement);
				break;
			case "iframe":
			case "object":
				listenToNonDelegatedEvent("load", domElement);
				break;
			case "video":
			case "audio":
				for (hasSrc = 0; hasSrc < mediaEventTypes.length; hasSrc++) listenToNonDelegatedEvent(mediaEventTypes[hasSrc], domElement);
				break;
			case "image":
				listenToNonDelegatedEvent("error", domElement);
				listenToNonDelegatedEvent("load", domElement);
				break;
			case "details":
				listenToNonDelegatedEvent("toggle", domElement);
				break;
			case "embed":
			case "source":
			case "link": listenToNonDelegatedEvent("error", domElement), listenToNonDelegatedEvent("load", domElement);
			case "area":
			case "base":
			case "br":
			case "col":
			case "hr":
			case "keygen":
			case "meta":
			case "param":
			case "track":
			case "wbr":
			case "menuitem":
				for (defaultChecked in props) if (props.hasOwnProperty(defaultChecked) && (hasSrc = props[defaultChecked], null != hasSrc)) switch (defaultChecked) {
					case "children":
					case "dangerouslySetInnerHTML": throw Error(formatProdErrorMessage(137, tag));
					default: setProp(domElement, tag, defaultChecked, hasSrc, props, null);
				}
				return;
			default: if (isCustomElement(tag)) {
				for (propValue$184 in props) props.hasOwnProperty(propValue$184) && (hasSrc = props[propValue$184], void 0 !== hasSrc && setPropOnCustomElement(domElement, tag, propValue$184, hasSrc, props, void 0));
				return;
			}
		}
		for (defaultValue in props) props.hasOwnProperty(defaultValue) && (hasSrc = props[defaultValue], null != hasSrc && setProp(domElement, tag, defaultValue, hasSrc, props, null));
	}
	function updateProperties(domElement, tag, lastProps, nextProps) {
		switch (tag) {
			case "div":
			case "span":
			case "svg":
			case "path":
			case "a":
			case "g":
			case "p":
			case "li": break;
			case "input":
				var name = null, type = null, value = null, defaultValue = null, lastDefaultValue = null, checked = null, defaultChecked = null;
				for (propKey in lastProps) {
					var lastProp = lastProps[propKey];
					if (lastProps.hasOwnProperty(propKey) && null != lastProp) switch (propKey) {
						case "checked": break;
						case "value": break;
						case "defaultValue": lastDefaultValue = lastProp;
						default: nextProps.hasOwnProperty(propKey) || setProp(domElement, tag, propKey, null, nextProps, lastProp);
					}
				}
				for (var propKey$201 in nextProps) {
					var propKey = nextProps[propKey$201];
					lastProp = lastProps[propKey$201];
					if (nextProps.hasOwnProperty(propKey$201) && (null != propKey || null != lastProp)) switch (propKey$201) {
						case "type":
							type = propKey;
							break;
						case "name":
							name = propKey;
							break;
						case "checked":
							checked = propKey;
							break;
						case "defaultChecked":
							defaultChecked = propKey;
							break;
						case "value":
							value = propKey;
							break;
						case "defaultValue":
							defaultValue = propKey;
							break;
						case "children":
						case "dangerouslySetInnerHTML":
							if (null != propKey) throw Error(formatProdErrorMessage(137, tag));
							break;
						default: propKey !== lastProp && setProp(domElement, tag, propKey$201, propKey, nextProps, lastProp);
					}
				}
				updateInput(domElement, value, defaultValue, lastDefaultValue, checked, defaultChecked, type, name);
				return;
			case "select":
				propKey = value = defaultValue = propKey$201 = null;
				for (type in lastProps) if (lastDefaultValue = lastProps[type], lastProps.hasOwnProperty(type) && null != lastDefaultValue) switch (type) {
					case "value": break;
					case "multiple": propKey = lastDefaultValue;
					default: nextProps.hasOwnProperty(type) || setProp(domElement, tag, type, null, nextProps, lastDefaultValue);
				}
				for (name in nextProps) if (type = nextProps[name], lastDefaultValue = lastProps[name], nextProps.hasOwnProperty(name) && (null != type || null != lastDefaultValue)) switch (name) {
					case "value":
						propKey$201 = type;
						break;
					case "defaultValue":
						defaultValue = type;
						break;
					case "multiple": value = type;
					default: type !== lastDefaultValue && setProp(domElement, tag, name, type, nextProps, lastDefaultValue);
				}
				tag = defaultValue;
				lastProps = value;
				nextProps = propKey;
				null != propKey$201 ? updateOptions(domElement, !!lastProps, propKey$201, !1) : !!nextProps !== !!lastProps && (null != tag ? updateOptions(domElement, !!lastProps, tag, !0) : updateOptions(domElement, !!lastProps, lastProps ? [] : "", !1));
				return;
			case "textarea":
				propKey = propKey$201 = null;
				for (defaultValue in lastProps) if (name = lastProps[defaultValue], lastProps.hasOwnProperty(defaultValue) && null != name && !nextProps.hasOwnProperty(defaultValue)) switch (defaultValue) {
					case "value": break;
					case "children": break;
					default: setProp(domElement, tag, defaultValue, null, nextProps, name);
				}
				for (value in nextProps) if (name = nextProps[value], type = lastProps[value], nextProps.hasOwnProperty(value) && (null != name || null != type)) switch (value) {
					case "value":
						propKey$201 = name;
						break;
					case "defaultValue":
						propKey = name;
						break;
					case "children": break;
					case "dangerouslySetInnerHTML":
						if (null != name) throw Error(formatProdErrorMessage(91));
						break;
					default: name !== type && setProp(domElement, tag, value, name, nextProps, type);
				}
				updateTextarea(domElement, propKey$201, propKey);
				return;
			case "option":
				for (var propKey$217 in lastProps) if (propKey$201 = lastProps[propKey$217], lastProps.hasOwnProperty(propKey$217) && null != propKey$201 && !nextProps.hasOwnProperty(propKey$217)) switch (propKey$217) {
					case "selected":
						domElement.selected = !1;
						break;
					default: setProp(domElement, tag, propKey$217, null, nextProps, propKey$201);
				}
				for (lastDefaultValue in nextProps) if (propKey$201 = nextProps[lastDefaultValue], propKey = lastProps[lastDefaultValue], nextProps.hasOwnProperty(lastDefaultValue) && propKey$201 !== propKey && (null != propKey$201 || null != propKey)) switch (lastDefaultValue) {
					case "selected":
						domElement.selected = propKey$201 && "function" !== typeof propKey$201 && "symbol" !== typeof propKey$201;
						break;
					default: setProp(domElement, tag, lastDefaultValue, propKey$201, nextProps, propKey);
				}
				return;
			case "img":
			case "link":
			case "area":
			case "base":
			case "br":
			case "col":
			case "embed":
			case "hr":
			case "keygen":
			case "meta":
			case "param":
			case "source":
			case "track":
			case "wbr":
			case "menuitem":
				for (var propKey$222 in lastProps) propKey$201 = lastProps[propKey$222], lastProps.hasOwnProperty(propKey$222) && null != propKey$201 && !nextProps.hasOwnProperty(propKey$222) && setProp(domElement, tag, propKey$222, null, nextProps, propKey$201);
				for (checked in nextProps) if (propKey$201 = nextProps[checked], propKey = lastProps[checked], nextProps.hasOwnProperty(checked) && propKey$201 !== propKey && (null != propKey$201 || null != propKey)) switch (checked) {
					case "children":
					case "dangerouslySetInnerHTML":
						if (null != propKey$201) throw Error(formatProdErrorMessage(137, tag));
						break;
					default: setProp(domElement, tag, checked, propKey$201, nextProps, propKey);
				}
				return;
			default: if (isCustomElement(tag)) {
				for (var propKey$227 in lastProps) propKey$201 = lastProps[propKey$227], lastProps.hasOwnProperty(propKey$227) && void 0 !== propKey$201 && !nextProps.hasOwnProperty(propKey$227) && setPropOnCustomElement(domElement, tag, propKey$227, void 0, nextProps, propKey$201);
				for (defaultChecked in nextProps) propKey$201 = nextProps[defaultChecked], propKey = lastProps[defaultChecked], !nextProps.hasOwnProperty(defaultChecked) || propKey$201 === propKey || void 0 === propKey$201 && void 0 === propKey || setPropOnCustomElement(domElement, tag, defaultChecked, propKey$201, nextProps, propKey);
				return;
			}
		}
		for (var propKey$232 in lastProps) propKey$201 = lastProps[propKey$232], lastProps.hasOwnProperty(propKey$232) && null != propKey$201 && !nextProps.hasOwnProperty(propKey$232) && setProp(domElement, tag, propKey$232, null, nextProps, propKey$201);
		for (lastProp in nextProps) propKey$201 = nextProps[lastProp], propKey = lastProps[lastProp], !nextProps.hasOwnProperty(lastProp) || propKey$201 === propKey || null == propKey$201 && null == propKey || setProp(domElement, tag, lastProp, propKey$201, nextProps, propKey);
	}
	function isLikelyStaticResource(initiatorType) {
		switch (initiatorType) {
			case "css":
			case "script":
			case "font":
			case "img":
			case "image":
			case "input":
			case "link": return !0;
			default: return !1;
		}
	}
	function estimateBandwidth() {
		if ("function" === typeof performance.getEntriesByType) {
			for (var count = 0, bits = 0, resourceEntries = performance.getEntriesByType("resource"), i = 0; i < resourceEntries.length; i++) {
				var entry = resourceEntries[i], transferSize = entry.transferSize, initiatorType = entry.initiatorType, duration = entry.duration;
				if (transferSize && duration && isLikelyStaticResource(initiatorType)) {
					initiatorType = 0;
					duration = entry.responseEnd;
					for (i += 1; i < resourceEntries.length; i++) {
						var overlapEntry = resourceEntries[i], overlapStartTime = overlapEntry.startTime;
						if (overlapStartTime > duration) break;
						var overlapTransferSize = overlapEntry.transferSize, overlapInitiatorType = overlapEntry.initiatorType;
						overlapTransferSize && isLikelyStaticResource(overlapInitiatorType) && (overlapEntry = overlapEntry.responseEnd, initiatorType += overlapTransferSize * (overlapEntry < duration ? 1 : (duration - overlapStartTime) / (overlapEntry - overlapStartTime)));
					}
					--i;
					bits += 8 * (transferSize + initiatorType) / (entry.duration / 1e3);
					count++;
					if (10 < count) break;
				}
			}
			if (0 < count) return bits / count / 1e6;
		}
		return navigator.connection && (count = navigator.connection.downlink, "number" === typeof count) ? count : 5;
	}
	var eventsEnabled = null, selectionInformation = null;
	function getOwnerDocumentFromRootContainer(rootContainerElement) {
		return 9 === rootContainerElement.nodeType ? rootContainerElement : rootContainerElement.ownerDocument;
	}
	function getOwnHostContext(namespaceURI) {
		switch (namespaceURI) {
			case "http://www.w3.org/2000/svg": return 1;
			case "http://www.w3.org/1998/Math/MathML": return 2;
			default: return 0;
		}
	}
	function getChildHostContextProd(parentNamespace, type) {
		if (0 === parentNamespace) switch (type) {
			case "svg": return 1;
			case "math": return 2;
			default: return 0;
		}
		return 1 === parentNamespace && "foreignObject" === type ? 0 : parentNamespace;
	}
	function shouldSetTextContent(type, props) {
		return "textarea" === type || "noscript" === type || "string" === typeof props.children || "number" === typeof props.children || "bigint" === typeof props.children || "object" === typeof props.dangerouslySetInnerHTML && null !== props.dangerouslySetInnerHTML && null != props.dangerouslySetInnerHTML.__html;
	}
	var currentPopstateTransitionEvent = null;
	function shouldAttemptEagerTransition() {
		var event = window.event;
		if (event && "popstate" === event.type) {
			if (event === currentPopstateTransitionEvent) return !1;
			currentPopstateTransitionEvent = event;
			return !0;
		}
		currentPopstateTransitionEvent = null;
		return !1;
	}
	var scheduleTimeout = "function" === typeof setTimeout ? setTimeout : void 0, cancelTimeout = "function" === typeof clearTimeout ? clearTimeout : void 0, localPromise = "function" === typeof Promise ? Promise : void 0, scheduleMicrotask = "function" === typeof queueMicrotask ? queueMicrotask : "undefined" !== typeof localPromise ? function(callback) {
		return localPromise.resolve(null).then(callback).catch(handleErrorInNextTick);
	} : scheduleTimeout;
	function handleErrorInNextTick(error) {
		setTimeout(function() {
			throw error;
		});
	}
	function isSingletonScope(type) {
		return "head" === type;
	}
	function clearHydrationBoundary(parentInstance, hydrationInstance) {
		var node = hydrationInstance, depth = 0;
		do {
			var nextNode = node.nextSibling;
			parentInstance.removeChild(node);
			if (nextNode && 8 === nextNode.nodeType) if (node = nextNode.data, "/$" === node || "/&" === node) {
				if (0 === depth) {
					parentInstance.removeChild(nextNode);
					retryIfBlockedOn(hydrationInstance);
					return;
				}
				depth--;
			} else if ("$" === node || "$?" === node || "$~" === node || "$!" === node || "&" === node) depth++;
			else if ("html" === node) releaseSingletonInstance(parentInstance.ownerDocument.documentElement);
			else if ("head" === node) {
				node = parentInstance.ownerDocument.head;
				releaseSingletonInstance(node);
				for (var node$jscomp$0 = node.firstChild; node$jscomp$0;) {
					var nextNode$jscomp$0 = node$jscomp$0.nextSibling, nodeName = node$jscomp$0.nodeName;
					node$jscomp$0[internalHoistableMarker] || "SCRIPT" === nodeName || "STYLE" === nodeName || "LINK" === nodeName && "stylesheet" === node$jscomp$0.rel.toLowerCase() || node.removeChild(node$jscomp$0);
					node$jscomp$0 = nextNode$jscomp$0;
				}
			} else "body" === node && releaseSingletonInstance(parentInstance.ownerDocument.body);
			node = nextNode;
		} while (node);
		retryIfBlockedOn(hydrationInstance);
	}
	function hideOrUnhideDehydratedBoundary(suspenseInstance, isHidden) {
		var node = suspenseInstance;
		suspenseInstance = 0;
		do {
			var nextNode = node.nextSibling;
			1 === node.nodeType ? isHidden ? (node._stashedDisplay = node.style.display, node.style.display = "none") : (node.style.display = node._stashedDisplay || "", "" === node.getAttribute("style") && node.removeAttribute("style")) : 3 === node.nodeType && (isHidden ? (node._stashedText = node.nodeValue, node.nodeValue = "") : node.nodeValue = node._stashedText || "");
			if (nextNode && 8 === nextNode.nodeType) if (node = nextNode.data, "/$" === node) if (0 === suspenseInstance) break;
			else suspenseInstance--;
			else "$" !== node && "$?" !== node && "$~" !== node && "$!" !== node || suspenseInstance++;
			node = nextNode;
		} while (node);
	}
	function clearContainerSparingly(container) {
		var nextNode = container.firstChild;
		nextNode && 10 === nextNode.nodeType && (nextNode = nextNode.nextSibling);
		for (; nextNode;) {
			var node = nextNode;
			nextNode = nextNode.nextSibling;
			switch (node.nodeName) {
				case "HTML":
				case "HEAD":
				case "BODY":
					clearContainerSparingly(node);
					detachDeletedInstance(node);
					continue;
				case "SCRIPT":
				case "STYLE": continue;
				case "LINK": if ("stylesheet" === node.rel.toLowerCase()) continue;
			}
			container.removeChild(node);
		}
	}
	function canHydrateInstance(instance, type, props, inRootOrSingleton) {
		for (; 1 === instance.nodeType;) {
			var anyProps = props;
			if (instance.nodeName.toLowerCase() !== type.toLowerCase()) {
				if (!inRootOrSingleton && ("INPUT" !== instance.nodeName || "hidden" !== instance.type)) break;
			} else if (!inRootOrSingleton) if ("input" === type && "hidden" === instance.type) {
				var name = null == anyProps.name ? null : "" + anyProps.name;
				if ("hidden" === anyProps.type && instance.getAttribute("name") === name) return instance;
			} else return instance;
			else if (!instance[internalHoistableMarker]) switch (type) {
				case "meta":
					if (!instance.hasAttribute("itemprop")) break;
					return instance;
				case "link":
					name = instance.getAttribute("rel");
					if ("stylesheet" === name && instance.hasAttribute("data-precedence")) break;
					else if (name !== anyProps.rel || instance.getAttribute("href") !== (null == anyProps.href || "" === anyProps.href ? null : anyProps.href) || instance.getAttribute("crossorigin") !== (null == anyProps.crossOrigin ? null : anyProps.crossOrigin) || instance.getAttribute("title") !== (null == anyProps.title ? null : anyProps.title)) break;
					return instance;
				case "style":
					if (instance.hasAttribute("data-precedence")) break;
					return instance;
				case "script":
					name = instance.getAttribute("src");
					if ((name !== (null == anyProps.src ? null : anyProps.src) || instance.getAttribute("type") !== (null == anyProps.type ? null : anyProps.type) || instance.getAttribute("crossorigin") !== (null == anyProps.crossOrigin ? null : anyProps.crossOrigin)) && name && instance.hasAttribute("async") && !instance.hasAttribute("itemprop")) break;
					return instance;
				default: return instance;
			}
			instance = getNextHydratable(instance.nextSibling);
			if (null === instance) break;
		}
		return null;
	}
	function canHydrateTextInstance(instance, text, inRootOrSingleton) {
		if ("" === text) return null;
		for (; 3 !== instance.nodeType;) {
			if ((1 !== instance.nodeType || "INPUT" !== instance.nodeName || "hidden" !== instance.type) && !inRootOrSingleton) return null;
			instance = getNextHydratable(instance.nextSibling);
			if (null === instance) return null;
		}
		return instance;
	}
	function canHydrateHydrationBoundary(instance, inRootOrSingleton) {
		for (; 8 !== instance.nodeType;) {
			if ((1 !== instance.nodeType || "INPUT" !== instance.nodeName || "hidden" !== instance.type) && !inRootOrSingleton) return null;
			instance = getNextHydratable(instance.nextSibling);
			if (null === instance) return null;
		}
		return instance;
	}
	function isSuspenseInstancePending(instance) {
		return "$?" === instance.data || "$~" === instance.data;
	}
	function isSuspenseInstanceFallback(instance) {
		return "$!" === instance.data || "$?" === instance.data && "loading" !== instance.ownerDocument.readyState;
	}
	function registerSuspenseInstanceRetry(instance, callback) {
		var ownerDocument = instance.ownerDocument;
		if ("$~" === instance.data) instance._reactRetry = callback;
		else if ("$?" !== instance.data || "loading" !== ownerDocument.readyState) callback();
		else {
			var listener = function() {
				callback();
				ownerDocument.removeEventListener("DOMContentLoaded", listener);
			};
			ownerDocument.addEventListener("DOMContentLoaded", listener);
			instance._reactRetry = listener;
		}
	}
	function getNextHydratable(node) {
		for (; null != node; node = node.nextSibling) {
			var nodeType = node.nodeType;
			if (1 === nodeType || 3 === nodeType) break;
			if (8 === nodeType) {
				nodeType = node.data;
				if ("$" === nodeType || "$!" === nodeType || "$?" === nodeType || "$~" === nodeType || "&" === nodeType || "F!" === nodeType || "F" === nodeType) break;
				if ("/$" === nodeType || "/&" === nodeType) return null;
			}
		}
		return node;
	}
	var previousHydratableOnEnteringScopedSingleton = null;
	function getNextHydratableInstanceAfterHydrationBoundary(hydrationInstance) {
		hydrationInstance = hydrationInstance.nextSibling;
		for (var depth = 0; hydrationInstance;) {
			if (8 === hydrationInstance.nodeType) {
				var data = hydrationInstance.data;
				if ("/$" === data || "/&" === data) {
					if (0 === depth) return getNextHydratable(hydrationInstance.nextSibling);
					depth--;
				} else "$" !== data && "$!" !== data && "$?" !== data && "$~" !== data && "&" !== data || depth++;
			}
			hydrationInstance = hydrationInstance.nextSibling;
		}
		return null;
	}
	function getParentHydrationBoundary(targetInstance) {
		targetInstance = targetInstance.previousSibling;
		for (var depth = 0; targetInstance;) {
			if (8 === targetInstance.nodeType) {
				var data = targetInstance.data;
				if ("$" === data || "$!" === data || "$?" === data || "$~" === data || "&" === data) {
					if (0 === depth) return targetInstance;
					depth--;
				} else "/$" !== data && "/&" !== data || depth++;
			}
			targetInstance = targetInstance.previousSibling;
		}
		return null;
	}
	function resolveSingletonInstance(type, props, rootContainerInstance) {
		props = getOwnerDocumentFromRootContainer(rootContainerInstance);
		switch (type) {
			case "html":
				type = props.documentElement;
				if (!type) throw Error(formatProdErrorMessage(452));
				return type;
			case "head":
				type = props.head;
				if (!type) throw Error(formatProdErrorMessage(453));
				return type;
			case "body":
				type = props.body;
				if (!type) throw Error(formatProdErrorMessage(454));
				return type;
			default: throw Error(formatProdErrorMessage(451));
		}
	}
	function releaseSingletonInstance(instance) {
		for (var attributes = instance.attributes; attributes.length;) instance.removeAttributeNode(attributes[0]);
		detachDeletedInstance(instance);
	}
	var preloadPropsMap = /* @__PURE__ */ new Map(), preconnectsSet = /* @__PURE__ */ new Set();
	function getHoistableRoot(container) {
		return "function" === typeof container.getRootNode ? container.getRootNode() : 9 === container.nodeType ? container : container.ownerDocument;
	}
	var previousDispatcher = ReactDOMSharedInternals.d;
	ReactDOMSharedInternals.d = {
		f: flushSyncWork,
		r: requestFormReset,
		D: prefetchDNS,
		C: preconnect,
		L: preload,
		m: preloadModule,
		X: preinitScript,
		S: preinitStyle,
		M: preinitModuleScript
	};
	function flushSyncWork() {
		var previousWasRendering = previousDispatcher.f(), wasRendering = flushSyncWork$1();
		return previousWasRendering || wasRendering;
	}
	function requestFormReset(form) {
		var formInst = getInstanceFromNode(form);
		null !== formInst && 5 === formInst.tag && "form" === formInst.type ? requestFormReset$1(formInst) : previousDispatcher.r(form);
	}
	var globalDocument = "undefined" === typeof document ? null : document;
	function preconnectAs(rel, href, crossOrigin) {
		var ownerDocument = globalDocument;
		if (ownerDocument && "string" === typeof href && href) {
			var limitedEscapedHref = escapeSelectorAttributeValueInsideDoubleQuotes(href);
			limitedEscapedHref = "link[rel=\"" + rel + "\"][href=\"" + limitedEscapedHref + "\"]";
			"string" === typeof crossOrigin && (limitedEscapedHref += "[crossorigin=\"" + crossOrigin + "\"]");
			preconnectsSet.has(limitedEscapedHref) || (preconnectsSet.add(limitedEscapedHref), rel = {
				rel,
				crossOrigin,
				href
			}, null === ownerDocument.querySelector(limitedEscapedHref) && (href = ownerDocument.createElement("link"), setInitialProperties(href, "link", rel), markNodeAsHoistable(href), ownerDocument.head.appendChild(href)));
		}
	}
	function prefetchDNS(href) {
		previousDispatcher.D(href);
		preconnectAs("dns-prefetch", href, null);
	}
	function preconnect(href, crossOrigin) {
		previousDispatcher.C(href, crossOrigin);
		preconnectAs("preconnect", href, crossOrigin);
	}
	function preload(href, as, options) {
		previousDispatcher.L(href, as, options);
		var ownerDocument = globalDocument;
		if (ownerDocument && href && as) {
			var preloadSelector = "link[rel=\"preload\"][as=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(as) + "\"]";
			"image" === as ? options && options.imageSrcSet ? (preloadSelector += "[imagesrcset=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(options.imageSrcSet) + "\"]", "string" === typeof options.imageSizes && (preloadSelector += "[imagesizes=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(options.imageSizes) + "\"]")) : preloadSelector += "[href=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(href) + "\"]" : preloadSelector += "[href=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(href) + "\"]";
			var key = preloadSelector;
			switch (as) {
				case "style":
					key = getStyleKey(href);
					break;
				case "script": key = getScriptKey(href);
			}
			preloadPropsMap.has(key) || (href = assign({
				rel: "preload",
				href: "image" === as && options && options.imageSrcSet ? void 0 : href,
				as
			}, options), preloadPropsMap.set(key, href), null !== ownerDocument.querySelector(preloadSelector) || "style" === as && ownerDocument.querySelector(getStylesheetSelectorFromKey(key)) || "script" === as && ownerDocument.querySelector(getScriptSelectorFromKey(key)) || (as = ownerDocument.createElement("link"), setInitialProperties(as, "link", href), markNodeAsHoistable(as), ownerDocument.head.appendChild(as)));
		}
	}
	function preloadModule(href, options) {
		previousDispatcher.m(href, options);
		var ownerDocument = globalDocument;
		if (ownerDocument && href) {
			var as = options && "string" === typeof options.as ? options.as : "script", preloadSelector = "link[rel=\"modulepreload\"][as=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(as) + "\"][href=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(href) + "\"]", key = preloadSelector;
			switch (as) {
				case "audioworklet":
				case "paintworklet":
				case "serviceworker":
				case "sharedworker":
				case "worker":
				case "script": key = getScriptKey(href);
			}
			if (!preloadPropsMap.has(key) && (href = assign({
				rel: "modulepreload",
				href
			}, options), preloadPropsMap.set(key, href), null === ownerDocument.querySelector(preloadSelector))) {
				switch (as) {
					case "audioworklet":
					case "paintworklet":
					case "serviceworker":
					case "sharedworker":
					case "worker":
					case "script": if (ownerDocument.querySelector(getScriptSelectorFromKey(key))) return;
				}
				as = ownerDocument.createElement("link");
				setInitialProperties(as, "link", href);
				markNodeAsHoistable(as);
				ownerDocument.head.appendChild(as);
			}
		}
	}
	function preinitStyle(href, precedence, options) {
		previousDispatcher.S(href, precedence, options);
		var ownerDocument = globalDocument;
		if (ownerDocument && href) {
			var styles = getResourcesFromRoot(ownerDocument).hoistableStyles, key = getStyleKey(href);
			precedence = precedence || "default";
			var resource = styles.get(key);
			if (!resource) {
				var state = {
					loading: 0,
					preload: null
				};
				if (resource = ownerDocument.querySelector(getStylesheetSelectorFromKey(key))) state.loading = 5;
				else {
					href = assign({
						rel: "stylesheet",
						href,
						"data-precedence": precedence
					}, options);
					(options = preloadPropsMap.get(key)) && adoptPreloadPropsForStylesheet(href, options);
					var link = resource = ownerDocument.createElement("link");
					markNodeAsHoistable(link);
					setInitialProperties(link, "link", href);
					link._p = new Promise(function(resolve, reject) {
						link.onload = resolve;
						link.onerror = reject;
					});
					link.addEventListener("load", function() {
						state.loading |= 1;
					});
					link.addEventListener("error", function() {
						state.loading |= 2;
					});
					state.loading |= 4;
					insertStylesheet(resource, precedence, ownerDocument);
				}
				resource = {
					type: "stylesheet",
					instance: resource,
					count: 1,
					state
				};
				styles.set(key, resource);
			}
		}
	}
	function preinitScript(src, options) {
		previousDispatcher.X(src, options);
		var ownerDocument = globalDocument;
		if (ownerDocument && src) {
			var scripts = getResourcesFromRoot(ownerDocument).hoistableScripts, key = getScriptKey(src), resource = scripts.get(key);
			resource || (resource = ownerDocument.querySelector(getScriptSelectorFromKey(key)), resource || (src = assign({
				src,
				async: !0
			}, options), (options = preloadPropsMap.get(key)) && adoptPreloadPropsForScript(src, options), resource = ownerDocument.createElement("script"), markNodeAsHoistable(resource), setInitialProperties(resource, "link", src), ownerDocument.head.appendChild(resource)), resource = {
				type: "script",
				instance: resource,
				count: 1,
				state: null
			}, scripts.set(key, resource));
		}
	}
	function preinitModuleScript(src, options) {
		previousDispatcher.M(src, options);
		var ownerDocument = globalDocument;
		if (ownerDocument && src) {
			var scripts = getResourcesFromRoot(ownerDocument).hoistableScripts, key = getScriptKey(src), resource = scripts.get(key);
			resource || (resource = ownerDocument.querySelector(getScriptSelectorFromKey(key)), resource || (src = assign({
				src,
				async: !0,
				type: "module"
			}, options), (options = preloadPropsMap.get(key)) && adoptPreloadPropsForScript(src, options), resource = ownerDocument.createElement("script"), markNodeAsHoistable(resource), setInitialProperties(resource, "link", src), ownerDocument.head.appendChild(resource)), resource = {
				type: "script",
				instance: resource,
				count: 1,
				state: null
			}, scripts.set(key, resource));
		}
	}
	function getResource(type, currentProps, pendingProps, currentResource) {
		var JSCompiler_inline_result = (JSCompiler_inline_result = rootInstanceStackCursor.current) ? getHoistableRoot(JSCompiler_inline_result) : null;
		if (!JSCompiler_inline_result) throw Error(formatProdErrorMessage(446));
		switch (type) {
			case "meta":
			case "title": return null;
			case "style": return "string" === typeof pendingProps.precedence && "string" === typeof pendingProps.href ? (currentProps = getStyleKey(pendingProps.href), pendingProps = getResourcesFromRoot(JSCompiler_inline_result).hoistableStyles, currentResource = pendingProps.get(currentProps), currentResource || (currentResource = {
				type: "style",
				instance: null,
				count: 0,
				state: null
			}, pendingProps.set(currentProps, currentResource)), currentResource) : {
				type: "void",
				instance: null,
				count: 0,
				state: null
			};
			case "link":
				if ("stylesheet" === pendingProps.rel && "string" === typeof pendingProps.href && "string" === typeof pendingProps.precedence) {
					type = getStyleKey(pendingProps.href);
					var styles$243 = getResourcesFromRoot(JSCompiler_inline_result).hoistableStyles, resource$244 = styles$243.get(type);
					resource$244 || (JSCompiler_inline_result = JSCompiler_inline_result.ownerDocument || JSCompiler_inline_result, resource$244 = {
						type: "stylesheet",
						instance: null,
						count: 0,
						state: {
							loading: 0,
							preload: null
						}
					}, styles$243.set(type, resource$244), (styles$243 = JSCompiler_inline_result.querySelector(getStylesheetSelectorFromKey(type))) && !styles$243._p && (resource$244.instance = styles$243, resource$244.state.loading = 5), preloadPropsMap.has(type) || (pendingProps = {
						rel: "preload",
						as: "style",
						href: pendingProps.href,
						crossOrigin: pendingProps.crossOrigin,
						integrity: pendingProps.integrity,
						media: pendingProps.media,
						hrefLang: pendingProps.hrefLang,
						referrerPolicy: pendingProps.referrerPolicy
					}, preloadPropsMap.set(type, pendingProps), styles$243 || preloadStylesheet(JSCompiler_inline_result, type, pendingProps, resource$244.state)));
					if (currentProps && null === currentResource) throw Error(formatProdErrorMessage(528, ""));
					return resource$244;
				}
				if (currentProps && null !== currentResource) throw Error(formatProdErrorMessage(529, ""));
				return null;
			case "script": return currentProps = pendingProps.async, pendingProps = pendingProps.src, "string" === typeof pendingProps && currentProps && "function" !== typeof currentProps && "symbol" !== typeof currentProps ? (currentProps = getScriptKey(pendingProps), pendingProps = getResourcesFromRoot(JSCompiler_inline_result).hoistableScripts, currentResource = pendingProps.get(currentProps), currentResource || (currentResource = {
				type: "script",
				instance: null,
				count: 0,
				state: null
			}, pendingProps.set(currentProps, currentResource)), currentResource) : {
				type: "void",
				instance: null,
				count: 0,
				state: null
			};
			default: throw Error(formatProdErrorMessage(444, type));
		}
	}
	function getStyleKey(href) {
		return "href=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(href) + "\"";
	}
	function getStylesheetSelectorFromKey(key) {
		return "link[rel=\"stylesheet\"][" + key + "]";
	}
	function stylesheetPropsFromRawProps(rawProps) {
		return assign({}, rawProps, {
			"data-precedence": rawProps.precedence,
			precedence: null
		});
	}
	function preloadStylesheet(ownerDocument, key, preloadProps, state) {
		ownerDocument.querySelector("link[rel=\"preload\"][as=\"style\"][" + key + "]") ? state.loading = 1 : (key = ownerDocument.createElement("link"), state.preload = key, key.addEventListener("load", function() {
			return state.loading |= 1;
		}), key.addEventListener("error", function() {
			return state.loading |= 2;
		}), setInitialProperties(key, "link", preloadProps), markNodeAsHoistable(key), ownerDocument.head.appendChild(key));
	}
	function getScriptKey(src) {
		return "[src=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(src) + "\"]";
	}
	function getScriptSelectorFromKey(key) {
		return "script[async]" + key;
	}
	function acquireResource(hoistableRoot, resource, props) {
		resource.count++;
		if (null === resource.instance) switch (resource.type) {
			case "style":
				var instance = hoistableRoot.querySelector("style[data-href~=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(props.href) + "\"]");
				if (instance) return resource.instance = instance, markNodeAsHoistable(instance), instance;
				var styleProps = assign({}, props, {
					"data-href": props.href,
					"data-precedence": props.precedence,
					href: null,
					precedence: null
				});
				instance = (hoistableRoot.ownerDocument || hoistableRoot).createElement("style");
				markNodeAsHoistable(instance);
				setInitialProperties(instance, "style", styleProps);
				insertStylesheet(instance, props.precedence, hoistableRoot);
				return resource.instance = instance;
			case "stylesheet":
				styleProps = getStyleKey(props.href);
				var instance$249 = hoistableRoot.querySelector(getStylesheetSelectorFromKey(styleProps));
				if (instance$249) return resource.state.loading |= 4, resource.instance = instance$249, markNodeAsHoistable(instance$249), instance$249;
				instance = stylesheetPropsFromRawProps(props);
				(styleProps = preloadPropsMap.get(styleProps)) && adoptPreloadPropsForStylesheet(instance, styleProps);
				instance$249 = (hoistableRoot.ownerDocument || hoistableRoot).createElement("link");
				markNodeAsHoistable(instance$249);
				var linkInstance = instance$249;
				linkInstance._p = new Promise(function(resolve, reject) {
					linkInstance.onload = resolve;
					linkInstance.onerror = reject;
				});
				setInitialProperties(instance$249, "link", instance);
				resource.state.loading |= 4;
				insertStylesheet(instance$249, props.precedence, hoistableRoot);
				return resource.instance = instance$249;
			case "script":
				instance$249 = getScriptKey(props.src);
				if (styleProps = hoistableRoot.querySelector(getScriptSelectorFromKey(instance$249))) return resource.instance = styleProps, markNodeAsHoistable(styleProps), styleProps;
				instance = props;
				if (styleProps = preloadPropsMap.get(instance$249)) instance = assign({}, props), adoptPreloadPropsForScript(instance, styleProps);
				hoistableRoot = hoistableRoot.ownerDocument || hoistableRoot;
				styleProps = hoistableRoot.createElement("script");
				markNodeAsHoistable(styleProps);
				setInitialProperties(styleProps, "link", instance);
				hoistableRoot.head.appendChild(styleProps);
				return resource.instance = styleProps;
			case "void": return null;
			default: throw Error(formatProdErrorMessage(443, resource.type));
		}
		else "stylesheet" === resource.type && 0 === (resource.state.loading & 4) && (instance = resource.instance, resource.state.loading |= 4, insertStylesheet(instance, props.precedence, hoistableRoot));
		return resource.instance;
	}
	function insertStylesheet(instance, precedence, root) {
		for (var nodes = root.querySelectorAll("link[rel=\"stylesheet\"][data-precedence],style[data-precedence]"), last = nodes.length ? nodes[nodes.length - 1] : null, prior = last, i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			if (node.dataset.precedence === precedence) prior = node;
			else if (prior !== last) break;
		}
		prior ? prior.parentNode.insertBefore(instance, prior.nextSibling) : (precedence = 9 === root.nodeType ? root.head : root, precedence.insertBefore(instance, precedence.firstChild));
	}
	function adoptPreloadPropsForStylesheet(stylesheetProps, preloadProps) {
		stylesheetProps.crossOrigin ??= preloadProps.crossOrigin;
		stylesheetProps.referrerPolicy ??= preloadProps.referrerPolicy;
		stylesheetProps.title ??= preloadProps.title;
	}
	function adoptPreloadPropsForScript(scriptProps, preloadProps) {
		scriptProps.crossOrigin ??= preloadProps.crossOrigin;
		scriptProps.referrerPolicy ??= preloadProps.referrerPolicy;
		scriptProps.integrity ??= preloadProps.integrity;
	}
	var tagCaches = null;
	function getHydratableHoistableCache(type, keyAttribute, ownerDocument) {
		if (null === tagCaches) {
			var cache = /* @__PURE__ */ new Map();
			var caches = tagCaches = /* @__PURE__ */ new Map();
			caches.set(ownerDocument, cache);
		} else caches = tagCaches, cache = caches.get(ownerDocument), cache || (cache = /* @__PURE__ */ new Map(), caches.set(ownerDocument, cache));
		if (cache.has(type)) return cache;
		cache.set(type, null);
		ownerDocument = ownerDocument.getElementsByTagName(type);
		for (caches = 0; caches < ownerDocument.length; caches++) {
			var node = ownerDocument[caches];
			if (!(node[internalHoistableMarker] || node[internalInstanceKey] || "link" === type && "stylesheet" === node.getAttribute("rel")) && "http://www.w3.org/2000/svg" !== node.namespaceURI) {
				var nodeKey = node.getAttribute(keyAttribute) || "";
				nodeKey = type + nodeKey;
				var existing = cache.get(nodeKey);
				existing ? existing.push(node) : cache.set(nodeKey, [node]);
			}
		}
		return cache;
	}
	function mountHoistable(hoistableRoot, type, instance) {
		hoistableRoot = hoistableRoot.ownerDocument || hoistableRoot;
		hoistableRoot.head.insertBefore(instance, "title" === type ? hoistableRoot.querySelector("head > title") : null);
	}
	function isHostHoistableType(type, props, hostContext) {
		if (1 === hostContext || null != props.itemProp) return !1;
		switch (type) {
			case "meta":
			case "title": return !0;
			case "style":
				if ("string" !== typeof props.precedence || "string" !== typeof props.href || "" === props.href) break;
				return !0;
			case "link":
				if ("string" !== typeof props.rel || "string" !== typeof props.href || "" === props.href || props.onLoad || props.onError) break;
				switch (props.rel) {
					case "stylesheet": return type = props.disabled, "string" === typeof props.precedence && null == type;
					default: return !0;
				}
			case "script": if (props.async && "function" !== typeof props.async && "symbol" !== typeof props.async && !props.onLoad && !props.onError && props.src && "string" === typeof props.src) return !0;
		}
		return !1;
	}
	function preloadResource(resource) {
		return "stylesheet" === resource.type && 0 === (resource.state.loading & 3) ? !1 : !0;
	}
	function suspendResource(state, hoistableRoot, resource, props) {
		if ("stylesheet" === resource.type && ("string" !== typeof props.media || !1 !== matchMedia(props.media).matches) && 0 === (resource.state.loading & 4)) {
			if (null === resource.instance) {
				var key = getStyleKey(props.href), instance = hoistableRoot.querySelector(getStylesheetSelectorFromKey(key));
				if (instance) {
					hoistableRoot = instance._p;
					null !== hoistableRoot && "object" === typeof hoistableRoot && "function" === typeof hoistableRoot.then && (state.count++, state = onUnsuspend.bind(state), hoistableRoot.then(state, state));
					resource.state.loading |= 4;
					resource.instance = instance;
					markNodeAsHoistable(instance);
					return;
				}
				instance = hoistableRoot.ownerDocument || hoistableRoot;
				props = stylesheetPropsFromRawProps(props);
				(key = preloadPropsMap.get(key)) && adoptPreloadPropsForStylesheet(props, key);
				instance = instance.createElement("link");
				markNodeAsHoistable(instance);
				var linkInstance = instance;
				linkInstance._p = new Promise(function(resolve, reject) {
					linkInstance.onload = resolve;
					linkInstance.onerror = reject;
				});
				setInitialProperties(instance, "link", props);
				resource.instance = instance;
			}
			null === state.stylesheets && (state.stylesheets = /* @__PURE__ */ new Map());
			state.stylesheets.set(resource, hoistableRoot);
			(hoistableRoot = resource.state.preload) && 0 === (resource.state.loading & 3) && (state.count++, resource = onUnsuspend.bind(state), hoistableRoot.addEventListener("load", resource), hoistableRoot.addEventListener("error", resource));
		}
	}
	var estimatedBytesWithinLimit = 0;
	function waitForCommitToBeReady(state, timeoutOffset) {
		state.stylesheets && 0 === state.count && insertSuspendedStylesheets(state, state.stylesheets);
		return 0 < state.count || 0 < state.imgCount ? function(commit) {
			var stylesheetTimer = setTimeout(function() {
				state.stylesheets && insertSuspendedStylesheets(state, state.stylesheets);
				if (state.unsuspend) {
					var unsuspend = state.unsuspend;
					state.unsuspend = null;
					unsuspend();
				}
			}, 6e4 + timeoutOffset);
			0 < state.imgBytes && 0 === estimatedBytesWithinLimit && (estimatedBytesWithinLimit = 62500 * estimateBandwidth());
			var imgTimer = setTimeout(function() {
				state.waitingForImages = !1;
				if (0 === state.count && (state.stylesheets && insertSuspendedStylesheets(state, state.stylesheets), state.unsuspend)) {
					var unsuspend = state.unsuspend;
					state.unsuspend = null;
					unsuspend();
				}
			}, (state.imgBytes > estimatedBytesWithinLimit ? 50 : 800) + timeoutOffset);
			state.unsuspend = commit;
			return function() {
				state.unsuspend = null;
				clearTimeout(stylesheetTimer);
				clearTimeout(imgTimer);
			};
		} : null;
	}
	function onUnsuspend() {
		this.count--;
		if (0 === this.count && (0 === this.imgCount || !this.waitingForImages)) {
			if (this.stylesheets) insertSuspendedStylesheets(this, this.stylesheets);
			else if (this.unsuspend) {
				var unsuspend = this.unsuspend;
				this.unsuspend = null;
				unsuspend();
			}
		}
	}
	var precedencesByRoot = null;
	function insertSuspendedStylesheets(state, resources) {
		state.stylesheets = null;
		null !== state.unsuspend && (state.count++, precedencesByRoot = /* @__PURE__ */ new Map(), resources.forEach(insertStylesheetIntoRoot, state), precedencesByRoot = null, onUnsuspend.call(state));
	}
	function insertStylesheetIntoRoot(root, resource) {
		if (!(resource.state.loading & 4)) {
			var precedences = precedencesByRoot.get(root);
			if (precedences) var last = precedences.get(null);
			else {
				precedences = /* @__PURE__ */ new Map();
				precedencesByRoot.set(root, precedences);
				for (var nodes = root.querySelectorAll("link[data-precedence],style[data-precedence]"), i = 0; i < nodes.length; i++) {
					var node = nodes[i];
					if ("LINK" === node.nodeName || "not all" !== node.getAttribute("media")) precedences.set(node.dataset.precedence, node), last = node;
				}
				last && precedences.set(null, last);
			}
			nodes = resource.instance;
			node = nodes.getAttribute("data-precedence");
			i = precedences.get(node) || last;
			i === last && precedences.set(null, nodes);
			precedences.set(node, nodes);
			this.count++;
			last = onUnsuspend.bind(this);
			nodes.addEventListener("load", last);
			nodes.addEventListener("error", last);
			i ? i.parentNode.insertBefore(nodes, i.nextSibling) : (root = 9 === root.nodeType ? root.head : root, root.insertBefore(nodes, root.firstChild));
			resource.state.loading |= 4;
		}
	}
	var HostTransitionContext = {
		$$typeof: REACT_CONTEXT_TYPE,
		Provider: null,
		Consumer: null,
		_currentValue: sharedNotPendingObject,
		_currentValue2: sharedNotPendingObject,
		_threadCount: 0
	};
	function FiberRootNode(containerInfo, tag, hydrate, identifierPrefix, onUncaughtError, onCaughtError, onRecoverableError, onDefaultTransitionIndicator, formState) {
		this.tag = 1;
		this.containerInfo = containerInfo;
		this.pingCache = this.current = this.pendingChildren = null;
		this.timeoutHandle = -1;
		this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null;
		this.callbackPriority = 0;
		this.expirationTimes = createLaneMap(-1);
		this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0;
		this.entanglements = createLaneMap(0);
		this.hiddenUpdates = createLaneMap(null);
		this.identifierPrefix = identifierPrefix;
		this.onUncaughtError = onUncaughtError;
		this.onCaughtError = onCaughtError;
		this.onRecoverableError = onRecoverableError;
		this.pooledCache = null;
		this.pooledCacheLanes = 0;
		this.formState = formState;
		this.incompleteTransitions = /* @__PURE__ */ new Map();
	}
	function createFiberRoot(containerInfo, tag, hydrate, initialChildren, hydrationCallbacks, isStrictMode, identifierPrefix, formState, onUncaughtError, onCaughtError, onRecoverableError, onDefaultTransitionIndicator) {
		containerInfo = new FiberRootNode(containerInfo, tag, hydrate, identifierPrefix, onUncaughtError, onCaughtError, onRecoverableError, onDefaultTransitionIndicator, formState);
		tag = 1;
		!0 === isStrictMode && (tag |= 24);
		isStrictMode = createFiberImplClass(3, null, null, tag);
		containerInfo.current = isStrictMode;
		isStrictMode.stateNode = containerInfo;
		tag = createCache();
		tag.refCount++;
		containerInfo.pooledCache = tag;
		tag.refCount++;
		isStrictMode.memoizedState = {
			element: initialChildren,
			isDehydrated: hydrate,
			cache: tag
		};
		initializeUpdateQueue(isStrictMode);
		return containerInfo;
	}
	function getContextForSubtree(parentComponent) {
		if (!parentComponent) return emptyContextObject;
		parentComponent = emptyContextObject;
		return parentComponent;
	}
	function updateContainerImpl(rootFiber, lane, element, container, parentComponent, callback) {
		parentComponent = getContextForSubtree(parentComponent);
		null === container.context ? container.context = parentComponent : container.pendingContext = parentComponent;
		container = createUpdate(lane);
		container.payload = { element };
		callback = void 0 === callback ? null : callback;
		null !== callback && (container.callback = callback);
		element = enqueueUpdate(rootFiber, container, lane);
		null !== element && (scheduleUpdateOnFiber(element, rootFiber, lane), entangleTransitions(element, rootFiber, lane));
	}
	function markRetryLaneImpl(fiber, retryLane) {
		fiber = fiber.memoizedState;
		if (null !== fiber && null !== fiber.dehydrated) {
			var a = fiber.retryLane;
			fiber.retryLane = 0 !== a && a < retryLane ? a : retryLane;
		}
	}
	function markRetryLaneIfNotHydrated(fiber, retryLane) {
		markRetryLaneImpl(fiber, retryLane);
		(fiber = fiber.alternate) && markRetryLaneImpl(fiber, retryLane);
	}
	function attemptContinuousHydration(fiber) {
		if (13 === fiber.tag || 31 === fiber.tag) {
			var root = enqueueConcurrentRenderForLane(fiber, 67108864);
			null !== root && scheduleUpdateOnFiber(root, fiber, 67108864);
			markRetryLaneIfNotHydrated(fiber, 67108864);
		}
	}
	function attemptHydrationAtCurrentPriority(fiber) {
		if (13 === fiber.tag || 31 === fiber.tag) {
			var lane = requestUpdateLane();
			lane = getBumpedLaneForHydrationByLane(lane);
			var root = enqueueConcurrentRenderForLane(fiber, lane);
			null !== root && scheduleUpdateOnFiber(root, fiber, lane);
			markRetryLaneIfNotHydrated(fiber, lane);
		}
	}
	var _enabled = !0;
	function dispatchDiscreteEvent(domEventName, eventSystemFlags, container, nativeEvent) {
		var prevTransition = ReactSharedInternals.T;
		ReactSharedInternals.T = null;
		var previousPriority = ReactDOMSharedInternals.p;
		try {
			ReactDOMSharedInternals.p = 2, dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
		} finally {
			ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = prevTransition;
		}
	}
	function dispatchContinuousEvent(domEventName, eventSystemFlags, container, nativeEvent) {
		var prevTransition = ReactSharedInternals.T;
		ReactSharedInternals.T = null;
		var previousPriority = ReactDOMSharedInternals.p;
		try {
			ReactDOMSharedInternals.p = 8, dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
		} finally {
			ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = prevTransition;
		}
	}
	function dispatchEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent) {
		if (_enabled) {
			var blockedOn = findInstanceBlockingEvent(nativeEvent);
			if (null === blockedOn) dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, return_targetInst, targetContainer), clearIfContinuousEvent(domEventName, nativeEvent);
			else if (queueIfContinuousEvent(blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent)) nativeEvent.stopPropagation();
			else if (clearIfContinuousEvent(domEventName, nativeEvent), eventSystemFlags & 4 && -1 < discreteReplayableEvents.indexOf(domEventName)) {
				for (; null !== blockedOn;) {
					var fiber = getInstanceFromNode(blockedOn);
					if (null !== fiber) switch (fiber.tag) {
						case 3:
							fiber = fiber.stateNode;
							if (fiber.current.memoizedState.isDehydrated) {
								var lanes = getHighestPriorityLanes(fiber.pendingLanes);
								if (0 !== lanes) {
									var root = fiber;
									root.pendingLanes |= 2;
									for (root.entangledLanes |= 2; lanes;) {
										var lane = 1 << 31 - clz32(lanes);
										root.entanglements[1] |= lane;
										lanes &= ~lane;
									}
									ensureRootIsScheduled(fiber);
									0 === (executionContext & 6) && (workInProgressRootRenderTargetTime = now() + 500, flushSyncWorkAcrossRoots_impl(0, !1));
								}
							}
							break;
						case 31:
						case 13: root = enqueueConcurrentRenderForLane(fiber, 2), null !== root && scheduleUpdateOnFiber(root, fiber, 2), flushSyncWork$1(), markRetryLaneIfNotHydrated(fiber, 2);
					}
					fiber = findInstanceBlockingEvent(nativeEvent);
					null === fiber && dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, return_targetInst, targetContainer);
					if (fiber === blockedOn) break;
					blockedOn = fiber;
				}
				null !== blockedOn && nativeEvent.stopPropagation();
			} else dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, null, targetContainer);
		}
	}
	function findInstanceBlockingEvent(nativeEvent) {
		nativeEvent = getEventTarget(nativeEvent);
		return findInstanceBlockingTarget(nativeEvent);
	}
	var return_targetInst = null;
	function findInstanceBlockingTarget(targetNode) {
		return_targetInst = null;
		targetNode = getClosestInstanceFromNode(targetNode);
		if (null !== targetNode) {
			var nearestMounted = getNearestMountedFiber(targetNode);
			if (null === nearestMounted) targetNode = null;
			else {
				var tag = nearestMounted.tag;
				if (13 === tag) {
					targetNode = getSuspenseInstanceFromFiber(nearestMounted);
					if (null !== targetNode) return targetNode;
					targetNode = null;
				} else if (31 === tag) {
					targetNode = getActivityInstanceFromFiber(nearestMounted);
					if (null !== targetNode) return targetNode;
					targetNode = null;
				} else if (3 === tag) {
					if (nearestMounted.stateNode.current.memoizedState.isDehydrated) return 3 === nearestMounted.tag ? nearestMounted.stateNode.containerInfo : null;
					targetNode = null;
				} else nearestMounted !== targetNode && (targetNode = null);
			}
		}
		return_targetInst = targetNode;
		return null;
	}
	function getEventPriority(domEventName) {
		switch (domEventName) {
			case "beforetoggle":
			case "cancel":
			case "click":
			case "close":
			case "contextmenu":
			case "copy":
			case "cut":
			case "auxclick":
			case "dblclick":
			case "dragend":
			case "dragstart":
			case "drop":
			case "focusin":
			case "focusout":
			case "input":
			case "invalid":
			case "keydown":
			case "keypress":
			case "keyup":
			case "mousedown":
			case "mouseup":
			case "paste":
			case "pause":
			case "play":
			case "pointercancel":
			case "pointerdown":
			case "pointerup":
			case "ratechange":
			case "reset":
			case "resize":
			case "seeked":
			case "submit":
			case "toggle":
			case "touchcancel":
			case "touchend":
			case "touchstart":
			case "volumechange":
			case "change":
			case "selectionchange":
			case "textInput":
			case "compositionstart":
			case "compositionend":
			case "compositionupdate":
			case "beforeblur":
			case "afterblur":
			case "beforeinput":
			case "blur":
			case "fullscreenchange":
			case "focus":
			case "hashchange":
			case "popstate":
			case "select":
			case "selectstart": return 2;
			case "drag":
			case "dragenter":
			case "dragexit":
			case "dragleave":
			case "dragover":
			case "mousemove":
			case "mouseout":
			case "mouseover":
			case "pointermove":
			case "pointerout":
			case "pointerover":
			case "scroll":
			case "touchmove":
			case "wheel":
			case "mouseenter":
			case "mouseleave":
			case "pointerenter":
			case "pointerleave": return 8;
			case "message": switch (getCurrentPriorityLevel()) {
				case ImmediatePriority: return 2;
				case UserBlockingPriority: return 8;
				case NormalPriority$1:
				case LowPriority: return 32;
				case IdlePriority: return 268435456;
				default: return 32;
			}
			default: return 32;
		}
	}
	var hasScheduledReplayAttempt = !1, queuedFocus = null, queuedDrag = null, queuedMouse = null, queuedPointers = /* @__PURE__ */ new Map(), queuedPointerCaptures = /* @__PURE__ */ new Map(), queuedExplicitHydrationTargets = [], discreteReplayableEvents = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");
	function clearIfContinuousEvent(domEventName, nativeEvent) {
		switch (domEventName) {
			case "focusin":
			case "focusout":
				queuedFocus = null;
				break;
			case "dragenter":
			case "dragleave":
				queuedDrag = null;
				break;
			case "mouseover":
			case "mouseout":
				queuedMouse = null;
				break;
			case "pointerover":
			case "pointerout":
				queuedPointers.delete(nativeEvent.pointerId);
				break;
			case "gotpointercapture":
			case "lostpointercapture": queuedPointerCaptures.delete(nativeEvent.pointerId);
		}
	}
	function accumulateOrCreateContinuousQueuedReplayableEvent(existingQueuedEvent, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent) {
		if (null === existingQueuedEvent || existingQueuedEvent.nativeEvent !== nativeEvent) return existingQueuedEvent = {
			blockedOn,
			domEventName,
			eventSystemFlags,
			nativeEvent,
			targetContainers: [targetContainer]
		}, null !== blockedOn && (blockedOn = getInstanceFromNode(blockedOn), null !== blockedOn && attemptContinuousHydration(blockedOn)), existingQueuedEvent;
		existingQueuedEvent.eventSystemFlags |= eventSystemFlags;
		blockedOn = existingQueuedEvent.targetContainers;
		null !== targetContainer && -1 === blockedOn.indexOf(targetContainer) && blockedOn.push(targetContainer);
		return existingQueuedEvent;
	}
	function queueIfContinuousEvent(blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent) {
		switch (domEventName) {
			case "focusin": return queuedFocus = accumulateOrCreateContinuousQueuedReplayableEvent(queuedFocus, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent), !0;
			case "dragenter": return queuedDrag = accumulateOrCreateContinuousQueuedReplayableEvent(queuedDrag, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent), !0;
			case "mouseover": return queuedMouse = accumulateOrCreateContinuousQueuedReplayableEvent(queuedMouse, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent), !0;
			case "pointerover":
				var pointerId = nativeEvent.pointerId;
				queuedPointers.set(pointerId, accumulateOrCreateContinuousQueuedReplayableEvent(queuedPointers.get(pointerId) || null, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent));
				return !0;
			case "gotpointercapture": return pointerId = nativeEvent.pointerId, queuedPointerCaptures.set(pointerId, accumulateOrCreateContinuousQueuedReplayableEvent(queuedPointerCaptures.get(pointerId) || null, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent)), !0;
		}
		return !1;
	}
	function attemptExplicitHydrationTarget(queuedTarget) {
		var targetInst = getClosestInstanceFromNode(queuedTarget.target);
		if (null !== targetInst) {
			var nearestMounted = getNearestMountedFiber(targetInst);
			if (null !== nearestMounted) {
				if (targetInst = nearestMounted.tag, 13 === targetInst) {
					if (targetInst = getSuspenseInstanceFromFiber(nearestMounted), null !== targetInst) {
						queuedTarget.blockedOn = targetInst;
						runWithPriority(queuedTarget.priority, function() {
							attemptHydrationAtCurrentPriority(nearestMounted);
						});
						return;
					}
				} else if (31 === targetInst) {
					if (targetInst = getActivityInstanceFromFiber(nearestMounted), null !== targetInst) {
						queuedTarget.blockedOn = targetInst;
						runWithPriority(queuedTarget.priority, function() {
							attemptHydrationAtCurrentPriority(nearestMounted);
						});
						return;
					}
				} else if (3 === targetInst && nearestMounted.stateNode.current.memoizedState.isDehydrated) {
					queuedTarget.blockedOn = 3 === nearestMounted.tag ? nearestMounted.stateNode.containerInfo : null;
					return;
				}
			}
		}
		queuedTarget.blockedOn = null;
	}
	function attemptReplayContinuousQueuedEvent(queuedEvent) {
		if (null !== queuedEvent.blockedOn) return !1;
		for (var targetContainers = queuedEvent.targetContainers; 0 < targetContainers.length;) {
			var nextBlockedOn = findInstanceBlockingEvent(queuedEvent.nativeEvent);
			if (null === nextBlockedOn) {
				nextBlockedOn = queuedEvent.nativeEvent;
				var nativeEventClone = new nextBlockedOn.constructor(nextBlockedOn.type, nextBlockedOn);
				currentReplayingEvent = nativeEventClone;
				nextBlockedOn.target.dispatchEvent(nativeEventClone);
				currentReplayingEvent = null;
			} else return targetContainers = getInstanceFromNode(nextBlockedOn), null !== targetContainers && attemptContinuousHydration(targetContainers), queuedEvent.blockedOn = nextBlockedOn, !1;
			targetContainers.shift();
		}
		return !0;
	}
	function attemptReplayContinuousQueuedEventInMap(queuedEvent, key, map) {
		attemptReplayContinuousQueuedEvent(queuedEvent) && map.delete(key);
	}
	function replayUnblockedEvents() {
		hasScheduledReplayAttempt = !1;
		null !== queuedFocus && attemptReplayContinuousQueuedEvent(queuedFocus) && (queuedFocus = null);
		null !== queuedDrag && attemptReplayContinuousQueuedEvent(queuedDrag) && (queuedDrag = null);
		null !== queuedMouse && attemptReplayContinuousQueuedEvent(queuedMouse) && (queuedMouse = null);
		queuedPointers.forEach(attemptReplayContinuousQueuedEventInMap);
		queuedPointerCaptures.forEach(attemptReplayContinuousQueuedEventInMap);
	}
	function scheduleCallbackIfUnblocked(queuedEvent, unblocked) {
		queuedEvent.blockedOn === unblocked && (queuedEvent.blockedOn = null, hasScheduledReplayAttempt || (hasScheduledReplayAttempt = !0, Scheduler.unstable_scheduleCallback(Scheduler.unstable_NormalPriority, replayUnblockedEvents)));
	}
	var lastScheduledReplayQueue = null;
	function scheduleReplayQueueIfNeeded(formReplayingQueue) {
		lastScheduledReplayQueue !== formReplayingQueue && (lastScheduledReplayQueue = formReplayingQueue, Scheduler.unstable_scheduleCallback(Scheduler.unstable_NormalPriority, function() {
			lastScheduledReplayQueue === formReplayingQueue && (lastScheduledReplayQueue = null);
			for (var i = 0; i < formReplayingQueue.length; i += 3) {
				var form = formReplayingQueue[i], submitterOrAction = formReplayingQueue[i + 1], formData = formReplayingQueue[i + 2];
				if ("function" !== typeof submitterOrAction) if (null === findInstanceBlockingTarget(submitterOrAction || form)) continue;
				else break;
				var formInst = getInstanceFromNode(form);
				null !== formInst && (formReplayingQueue.splice(i, 3), i -= 3, startHostTransition(formInst, {
					pending: !0,
					data: formData,
					method: form.method,
					action: submitterOrAction
				}, submitterOrAction, formData));
			}
		}));
	}
	function retryIfBlockedOn(unblocked) {
		function unblock(queuedEvent) {
			return scheduleCallbackIfUnblocked(queuedEvent, unblocked);
		}
		null !== queuedFocus && scheduleCallbackIfUnblocked(queuedFocus, unblocked);
		null !== queuedDrag && scheduleCallbackIfUnblocked(queuedDrag, unblocked);
		null !== queuedMouse && scheduleCallbackIfUnblocked(queuedMouse, unblocked);
		queuedPointers.forEach(unblock);
		queuedPointerCaptures.forEach(unblock);
		for (var i = 0; i < queuedExplicitHydrationTargets.length; i++) {
			var queuedTarget = queuedExplicitHydrationTargets[i];
			queuedTarget.blockedOn === unblocked && (queuedTarget.blockedOn = null);
		}
		for (; 0 < queuedExplicitHydrationTargets.length && (i = queuedExplicitHydrationTargets[0], null === i.blockedOn);) attemptExplicitHydrationTarget(i), null === i.blockedOn && queuedExplicitHydrationTargets.shift();
		i = (unblocked.ownerDocument || unblocked).$$reactFormReplay;
		if (null != i) for (queuedTarget = 0; queuedTarget < i.length; queuedTarget += 3) {
			var form = i[queuedTarget], submitterOrAction = i[queuedTarget + 1], formProps = form[internalPropsKey] || null;
			if ("function" === typeof submitterOrAction) formProps || scheduleReplayQueueIfNeeded(i);
			else if (formProps) {
				var action = null;
				if (submitterOrAction && submitterOrAction.hasAttribute("formAction")) {
					if (form = submitterOrAction, formProps = submitterOrAction[internalPropsKey] || null) action = formProps.formAction;
					else if (null !== findInstanceBlockingTarget(form)) continue;
				} else action = formProps.action;
				"function" === typeof action ? i[queuedTarget + 1] = action : (i.splice(queuedTarget, 3), queuedTarget -= 3);
				scheduleReplayQueueIfNeeded(i);
			}
		}
	}
	function defaultOnDefaultTransitionIndicator() {
		function handleNavigate(event) {
			event.canIntercept && "react-transition" === event.info && event.intercept({
				handler: function() {
					return new Promise(function(resolve) {
						return pendingResolve = resolve;
					});
				},
				focusReset: "manual",
				scroll: "manual"
			});
		}
		function handleNavigateComplete() {
			null !== pendingResolve && (pendingResolve(), pendingResolve = null);
			isCancelled || setTimeout(startFakeNavigation, 20);
		}
		function startFakeNavigation() {
			if (!isCancelled && !navigation.transition) {
				var currentEntry = navigation.currentEntry;
				currentEntry && null != currentEntry.url && navigation.navigate(currentEntry.url, {
					state: currentEntry.getState(),
					info: "react-transition",
					history: "replace"
				});
			}
		}
		if ("object" === typeof navigation) {
			var isCancelled = !1, pendingResolve = null;
			navigation.addEventListener("navigate", handleNavigate);
			navigation.addEventListener("navigatesuccess", handleNavigateComplete);
			navigation.addEventListener("navigateerror", handleNavigateComplete);
			setTimeout(startFakeNavigation, 100);
			return function() {
				isCancelled = !0;
				navigation.removeEventListener("navigate", handleNavigate);
				navigation.removeEventListener("navigatesuccess", handleNavigateComplete);
				navigation.removeEventListener("navigateerror", handleNavigateComplete);
				null !== pendingResolve && (pendingResolve(), pendingResolve = null);
			};
		}
	}
	function ReactDOMRoot(internalRoot) {
		this._internalRoot = internalRoot;
	}
	ReactDOMHydrationRoot.prototype.render = ReactDOMRoot.prototype.render = function(children) {
		var root = this._internalRoot;
		if (null === root) throw Error(formatProdErrorMessage(409));
		var current = root.current;
		updateContainerImpl(current, requestUpdateLane(), children, root, null, null);
	};
	ReactDOMHydrationRoot.prototype.unmount = ReactDOMRoot.prototype.unmount = function() {
		var root = this._internalRoot;
		if (null !== root) {
			this._internalRoot = null;
			var container = root.containerInfo;
			updateContainerImpl(root.current, 2, null, root, null, null);
			flushSyncWork$1();
			container[internalContainerInstanceKey] = null;
		}
	};
	function ReactDOMHydrationRoot(internalRoot) {
		this._internalRoot = internalRoot;
	}
	ReactDOMHydrationRoot.prototype.unstable_scheduleHydration = function(target) {
		if (target) {
			var updatePriority = resolveUpdatePriority();
			target = {
				blockedOn: null,
				target,
				priority: updatePriority
			};
			for (var i = 0; i < queuedExplicitHydrationTargets.length && 0 !== updatePriority && updatePriority < queuedExplicitHydrationTargets[i].priority; i++);
			queuedExplicitHydrationTargets.splice(i, 0, target);
			0 === i && attemptExplicitHydrationTarget(target);
		}
	};
	var isomorphicReactPackageVersion$jscomp$inline_1840 = React.version;
	if ("19.2.6" !== isomorphicReactPackageVersion$jscomp$inline_1840) throw Error(formatProdErrorMessage(527, isomorphicReactPackageVersion$jscomp$inline_1840, "19.2.6"));
	ReactDOMSharedInternals.findDOMNode = function(componentOrElement) {
		var fiber = componentOrElement._reactInternals;
		if (void 0 === fiber) {
			if ("function" === typeof componentOrElement.render) throw Error(formatProdErrorMessage(188));
			componentOrElement = Object.keys(componentOrElement).join(",");
			throw Error(formatProdErrorMessage(268, componentOrElement));
		}
		componentOrElement = findCurrentFiberUsingSlowPath(fiber);
		componentOrElement = null !== componentOrElement ? findCurrentHostFiberImpl(componentOrElement) : null;
		componentOrElement = null === componentOrElement ? null : componentOrElement.stateNode;
		return componentOrElement;
	};
	var internals$jscomp$inline_2347 = {
		bundleType: 0,
		version: "19.2.6",
		rendererPackageName: "react-dom",
		currentDispatcherRef: ReactSharedInternals,
		reconcilerVersion: "19.2.6"
	};
	if ("undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__) {
		var hook$jscomp$inline_2348 = __REACT_DEVTOOLS_GLOBAL_HOOK__;
		if (!hook$jscomp$inline_2348.isDisabled && hook$jscomp$inline_2348.supportsFiber) try {
			rendererID = hook$jscomp$inline_2348.inject(internals$jscomp$inline_2347), injectedHook = hook$jscomp$inline_2348;
		} catch (err) {}
	}
	exports.createRoot = function(container, options) {
		if (!isValidContainer(container)) throw Error(formatProdErrorMessage(299));
		var isStrictMode = !1, identifierPrefix = "", onUncaughtError = defaultOnUncaughtError, onCaughtError = defaultOnCaughtError, onRecoverableError = defaultOnRecoverableError;
		null !== options && void 0 !== options && (!0 === options.unstable_strictMode && (isStrictMode = !0), void 0 !== options.identifierPrefix && (identifierPrefix = options.identifierPrefix), void 0 !== options.onUncaughtError && (onUncaughtError = options.onUncaughtError), void 0 !== options.onCaughtError && (onCaughtError = options.onCaughtError), void 0 !== options.onRecoverableError && (onRecoverableError = options.onRecoverableError));
		options = createFiberRoot(container, 1, !1, null, null, isStrictMode, identifierPrefix, null, onUncaughtError, onCaughtError, onRecoverableError, defaultOnDefaultTransitionIndicator);
		container[internalContainerInstanceKey] = options.current;
		listenToAllSupportedEvents(container);
		return new ReactDOMRoot(options);
	};
}));
//#endregion
//#region ../../node_modules/.pnpm/react-dom@19.2.6_react@19.2.6/node_modules/react-dom/client.js
var require_client = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function checkDCE() {
		if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== "function") return;
		try {
			__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
		} catch (err) {
			console.error(err);
		}
	}
	checkDCE();
	module.exports = require_react_dom_client_production();
}));
//#endregion
//#region ../../node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/deep-compare-strict.js
function deepCompareStrict(a, b) {
	const typeofa = typeof a;
	if (typeofa !== typeof b) return false;
	if (Array.isArray(a)) {
		if (!Array.isArray(b)) return false;
		const length = a.length;
		if (length !== b.length) return false;
		for (let i = 0; i < length; i++) if (!deepCompareStrict(a[i], b[i])) return false;
		return true;
	}
	if (typeofa === "object") {
		if (!a || !b) return a === b;
		const aKeys = Object.keys(a);
		const bKeys = Object.keys(b);
		if (aKeys.length !== bKeys.length) return false;
		for (const k of aKeys) if (!deepCompareStrict(a[k], b[k])) return false;
		return true;
	}
	return a === b;
}
//#endregion
//#region ../../node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/pointer.js
function encodePointer(p) {
	return encodeURI(escapePointer(p));
}
function escapePointer(p) {
	return p.replace(/~/g, "~0").replace(/\//g, "~1");
}
//#endregion
//#region ../../node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/dereference.js
var schemaArrayKeyword = {
	prefixItems: true,
	items: true,
	allOf: true,
	anyOf: true,
	oneOf: true
};
var schemaMapKeyword = {
	$defs: true,
	definitions: true,
	properties: true,
	patternProperties: true,
	dependentSchemas: true
};
var ignoredKeyword = {
	id: true,
	$id: true,
	$ref: true,
	$schema: true,
	$anchor: true,
	$vocabulary: true,
	$comment: true,
	default: true,
	enum: true,
	const: true,
	required: true,
	type: true,
	maximum: true,
	minimum: true,
	exclusiveMaximum: true,
	exclusiveMinimum: true,
	multipleOf: true,
	maxLength: true,
	minLength: true,
	pattern: true,
	format: true,
	maxItems: true,
	minItems: true,
	uniqueItems: true,
	maxProperties: true,
	minProperties: true
};
var initialBaseURI = typeof self !== "undefined" && self.location && self.location.origin !== "null" ? new URL(self.location.origin + self.location.pathname + location.search) : new URL("https://github.com/cfworker");
function dereference(schema, lookup = Object.create(null), baseURI = initialBaseURI, basePointer = "") {
	if (schema && typeof schema === "object" && !Array.isArray(schema)) {
		const id = schema.$id || schema.id;
		if (id) {
			const url = new URL(id, baseURI.href);
			if (url.hash.length > 1) lookup[url.href] = schema;
			else {
				url.hash = "";
				if (basePointer === "") baseURI = url;
				else dereference(schema, lookup, baseURI);
			}
		}
	} else if (schema !== true && schema !== false) return lookup;
	const schemaURI = baseURI.href + (basePointer ? "#" + basePointer : "");
	if (lookup[schemaURI] !== void 0) throw new Error(`Duplicate schema URI "${schemaURI}".`);
	lookup[schemaURI] = schema;
	if (schema === true || schema === false) return lookup;
	if (schema.__absolute_uri__ === void 0) Object.defineProperty(schema, "__absolute_uri__", {
		enumerable: false,
		value: schemaURI
	});
	if (schema.$ref && schema.__absolute_ref__ === void 0) {
		const url = new URL(schema.$ref, baseURI.href);
		url.hash = url.hash;
		Object.defineProperty(schema, "__absolute_ref__", {
			enumerable: false,
			value: url.href
		});
	}
	if (schema.$recursiveRef && schema.__absolute_recursive_ref__ === void 0) {
		const url = new URL(schema.$recursiveRef, baseURI.href);
		url.hash = url.hash;
		Object.defineProperty(schema, "__absolute_recursive_ref__", {
			enumerable: false,
			value: url.href
		});
	}
	if (schema.$anchor) {
		const url = new URL("#" + schema.$anchor, baseURI.href);
		lookup[url.href] = schema;
	}
	for (let key in schema) {
		if (ignoredKeyword[key]) continue;
		const keyBase = `${basePointer}/${encodePointer(key)}`;
		const subSchema = schema[key];
		if (Array.isArray(subSchema)) {
			if (schemaArrayKeyword[key]) {
				const length = subSchema.length;
				for (let i = 0; i < length; i++) dereference(subSchema[i], lookup, baseURI, `${keyBase}/${i}`);
			}
		} else if (schemaMapKeyword[key]) for (let subKey in subSchema) dereference(subSchema[subKey], lookup, baseURI, `${keyBase}/${encodePointer(subKey)}`);
		else dereference(subSchema, lookup, baseURI, keyBase);
	}
	return lookup;
}
//#endregion
//#region ../../node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/format.js
var DATE = /^(\d\d\d\d)-(\d\d)-(\d\d)$/;
var DAYS = [
	0,
	31,
	28,
	31,
	30,
	31,
	30,
	31,
	31,
	30,
	31,
	30,
	31
];
var TIME = /^(\d\d):(\d\d):(\d\d)(\.\d+)?(z|[+-]\d\d(?::?\d\d)?)?$/i;
var HOSTNAME = /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i;
var URIREF = /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
var URITEMPLATE = /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i;
var URL_ = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u{00a1}-\u{ffff}0-9]+-?)*[a-z\u{00a1}-\u{ffff}0-9]+)(?:\.(?:[a-z\u{00a1}-\u{ffff}0-9]+-?)*[a-z\u{00a1}-\u{ffff}0-9]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu;
var UUID = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
var JSON_POINTER = /^(?:\/(?:[^~/]|~0|~1)*)*$/;
var JSON_POINTER_URI_FRAGMENT = /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i;
var RELATIVE_JSON_POINTER = /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/;
var EMAIL = (input) => {
	if (input[0] === "\"") return false;
	const [name, host, ...rest] = input.split("@");
	if (!name || !host || rest.length !== 0 || name.length > 64 || host.length > 253) return false;
	if (name[0] === "." || name.endsWith(".") || name.includes("..")) return false;
	if (!/^[a-z0-9.-]+$/i.test(host) || !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(name)) return false;
	return host.split(".").every((part) => /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/i.test(part));
};
var IPV4 = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
var IPV6 = /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i;
var DURATION = (input) => input.length > 1 && input.length < 80 && (/^P\d+([.,]\d+)?W$/.test(input) || /^P[\dYMDTHS]*(\d[.,]\d+)?[YMDHS]$/.test(input) && /^P([.,\d]+Y)?([.,\d]+M)?([.,\d]+D)?(T([.,\d]+H)?([.,\d]+M)?([.,\d]+S)?)?$/.test(input));
function bind(r) {
	return r.test.bind(r);
}
var format = {
	date,
	time: time.bind(void 0, false),
	"date-time": date_time,
	duration: DURATION,
	uri,
	"uri-reference": bind(URIREF),
	"uri-template": bind(URITEMPLATE),
	url: bind(URL_),
	email: EMAIL,
	hostname: bind(HOSTNAME),
	ipv4: bind(IPV4),
	ipv6: bind(IPV6),
	regex,
	uuid: bind(UUID),
	"json-pointer": bind(JSON_POINTER),
	"json-pointer-uri-fragment": bind(JSON_POINTER_URI_FRAGMENT),
	"relative-json-pointer": bind(RELATIVE_JSON_POINTER)
};
function isLeapYear(year) {
	return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}
function date(str) {
	const matches = str.match(DATE);
	if (!matches) return false;
	const year = +matches[1];
	const month = +matches[2];
	const day = +matches[3];
	return month >= 1 && month <= 12 && day >= 1 && day <= (month == 2 && isLeapYear(year) ? 29 : DAYS[month]);
}
function time(full, str) {
	const matches = str.match(TIME);
	if (!matches) return false;
	const hour = +matches[1];
	const minute = +matches[2];
	const second = +matches[3];
	const timeZone = !!matches[5];
	return (hour <= 23 && minute <= 59 && second <= 59 || hour == 23 && minute == 59 && second == 60) && (!full || timeZone);
}
var DATE_TIME_SEPARATOR = /t|\s/i;
function date_time(str) {
	const dateTime = str.split(DATE_TIME_SEPARATOR);
	return dateTime.length == 2 && date(dateTime[0]) && time(true, dateTime[1]);
}
var NOT_URI_FRAGMENT = /\/|:/;
var URI_PATTERN = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
function uri(str) {
	return NOT_URI_FRAGMENT.test(str) && URI_PATTERN.test(str);
}
var Z_ANCHOR = /[^\\]\\Z/;
function regex(str) {
	if (Z_ANCHOR.test(str)) return false;
	try {
		new RegExp(str, "u");
		return true;
	} catch (e) {
		return false;
	}
}
//#endregion
//#region ../../node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/ucs2-length.js
function ucs2length(s) {
	let result = 0;
	let length = s.length;
	let index = 0;
	let charCode;
	while (index < length) {
		result++;
		charCode = s.charCodeAt(index++);
		if (charCode >= 55296 && charCode <= 56319 && index < length) {
			charCode = s.charCodeAt(index);
			if ((charCode & 64512) == 56320) index++;
		}
	}
	return result;
}
//#endregion
//#region ../../node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/validate.js
function validate(instance, schema, draft = "2019-09", lookup = dereference(schema), shortCircuit = true, recursiveAnchor = null, instanceLocation = "#", schemaLocation = "#", evaluated = Object.create(null)) {
	if (schema === true) return {
		valid: true,
		errors: []
	};
	if (schema === false) return {
		valid: false,
		errors: [{
			instanceLocation,
			keyword: "false",
			keywordLocation: instanceLocation,
			error: "False boolean schema."
		}]
	};
	const rawInstanceType = typeof instance;
	let instanceType;
	switch (rawInstanceType) {
		case "boolean":
		case "number":
		case "string":
			instanceType = rawInstanceType;
			break;
		case "object":
			if (instance === null) instanceType = "null";
			else if (Array.isArray(instance)) instanceType = "array";
			else instanceType = "object";
			break;
		default: throw new Error(`Instances of "${rawInstanceType}" type are not supported.`);
	}
	const { $ref, $recursiveRef, $recursiveAnchor, type: $type, const: $const, enum: $enum, required: $required, not: $not, anyOf: $anyOf, allOf: $allOf, oneOf: $oneOf, if: $if, then: $then, else: $else, format: $format, properties: $properties, patternProperties: $patternProperties, additionalProperties: $additionalProperties, unevaluatedProperties: $unevaluatedProperties, minProperties: $minProperties, maxProperties: $maxProperties, propertyNames: $propertyNames, dependentRequired: $dependentRequired, dependentSchemas: $dependentSchemas, dependencies: $dependencies, prefixItems: $prefixItems, items: $items, additionalItems: $additionalItems, unevaluatedItems: $unevaluatedItems, contains: $contains, minContains: $minContains, maxContains: $maxContains, minItems: $minItems, maxItems: $maxItems, uniqueItems: $uniqueItems, minimum: $minimum, maximum: $maximum, exclusiveMinimum: $exclusiveMinimum, exclusiveMaximum: $exclusiveMaximum, multipleOf: $multipleOf, minLength: $minLength, maxLength: $maxLength, pattern: $pattern, __absolute_ref__, __absolute_recursive_ref__ } = schema;
	const errors = [];
	if ($recursiveAnchor === true && recursiveAnchor === null) recursiveAnchor = schema;
	if ($recursiveRef === "#") {
		const refSchema = recursiveAnchor === null ? lookup[__absolute_recursive_ref__] : recursiveAnchor;
		const keywordLocation = `${schemaLocation}/$recursiveRef`;
		const result = validate(instance, recursiveAnchor === null ? schema : recursiveAnchor, draft, lookup, shortCircuit, refSchema, instanceLocation, keywordLocation, evaluated);
		if (!result.valid) errors.push({
			instanceLocation,
			keyword: "$recursiveRef",
			keywordLocation,
			error: "A subschema had errors."
		}, ...result.errors);
	}
	if ($ref !== void 0) {
		const refSchema = lookup[__absolute_ref__ || $ref];
		if (refSchema === void 0) {
			let message = `Unresolved $ref "${$ref}".`;
			if (__absolute_ref__ && __absolute_ref__ !== $ref) message += `  Absolute URI "${__absolute_ref__}".`;
			message += `\nKnown schemas:\n- ${Object.keys(lookup).join("\n- ")}`;
			throw new Error(message);
		}
		const keywordLocation = `${schemaLocation}/$ref`;
		const result = validate(instance, refSchema, draft, lookup, shortCircuit, recursiveAnchor, instanceLocation, keywordLocation, evaluated);
		if (!result.valid) errors.push({
			instanceLocation,
			keyword: "$ref",
			keywordLocation,
			error: "A subschema had errors."
		}, ...result.errors);
		if (draft === "4" || draft === "7") return {
			valid: errors.length === 0,
			errors
		};
	}
	if (Array.isArray($type)) {
		let length = $type.length;
		let valid = false;
		for (let i = 0; i < length; i++) if (instanceType === $type[i] || $type[i] === "integer" && instanceType === "number" && instance % 1 === 0 && instance === instance) {
			valid = true;
			break;
		}
		if (!valid) errors.push({
			instanceLocation,
			keyword: "type",
			keywordLocation: `${schemaLocation}/type`,
			error: `Instance type "${instanceType}" is invalid. Expected "${$type.join("\", \"")}".`
		});
	} else if ($type === "integer") {
		if (instanceType !== "number" || instance % 1 || instance !== instance) errors.push({
			instanceLocation,
			keyword: "type",
			keywordLocation: `${schemaLocation}/type`,
			error: `Instance type "${instanceType}" is invalid. Expected "${$type}".`
		});
	} else if ($type !== void 0 && instanceType !== $type) errors.push({
		instanceLocation,
		keyword: "type",
		keywordLocation: `${schemaLocation}/type`,
		error: `Instance type "${instanceType}" is invalid. Expected "${$type}".`
	});
	if ($const !== void 0) {
		if (instanceType === "object" || instanceType === "array") {
			if (!deepCompareStrict(instance, $const)) errors.push({
				instanceLocation,
				keyword: "const",
				keywordLocation: `${schemaLocation}/const`,
				error: `Instance does not match ${JSON.stringify($const)}.`
			});
		} else if (instance !== $const) errors.push({
			instanceLocation,
			keyword: "const",
			keywordLocation: `${schemaLocation}/const`,
			error: `Instance does not match ${JSON.stringify($const)}.`
		});
	}
	if ($enum !== void 0) {
		if (instanceType === "object" || instanceType === "array") {
			if (!$enum.some((value) => deepCompareStrict(instance, value))) errors.push({
				instanceLocation,
				keyword: "enum",
				keywordLocation: `${schemaLocation}/enum`,
				error: `Instance does not match any of ${JSON.stringify($enum)}.`
			});
		} else if (!$enum.some((value) => instance === value)) errors.push({
			instanceLocation,
			keyword: "enum",
			keywordLocation: `${schemaLocation}/enum`,
			error: `Instance does not match any of ${JSON.stringify($enum)}.`
		});
	}
	if ($not !== void 0) {
		const keywordLocation = `${schemaLocation}/not`;
		if (validate(instance, $not, draft, lookup, shortCircuit, recursiveAnchor, instanceLocation, keywordLocation).valid) errors.push({
			instanceLocation,
			keyword: "not",
			keywordLocation,
			error: "Instance matched \"not\" schema."
		});
	}
	let subEvaluateds = [];
	if ($anyOf !== void 0) {
		const keywordLocation = `${schemaLocation}/anyOf`;
		const errorsLength = errors.length;
		let anyValid = false;
		for (let i = 0; i < $anyOf.length; i++) {
			const subSchema = $anyOf[i];
			const subEvaluated = Object.create(evaluated);
			const result = validate(instance, subSchema, draft, lookup, shortCircuit, $recursiveAnchor === true ? recursiveAnchor : null, instanceLocation, `${keywordLocation}/${i}`, subEvaluated);
			errors.push(...result.errors);
			anyValid = anyValid || result.valid;
			if (result.valid) subEvaluateds.push(subEvaluated);
		}
		if (anyValid) errors.length = errorsLength;
		else errors.splice(errorsLength, 0, {
			instanceLocation,
			keyword: "anyOf",
			keywordLocation,
			error: "Instance does not match any subschemas."
		});
	}
	if ($allOf !== void 0) {
		const keywordLocation = `${schemaLocation}/allOf`;
		const errorsLength = errors.length;
		let allValid = true;
		for (let i = 0; i < $allOf.length; i++) {
			const subSchema = $allOf[i];
			const subEvaluated = Object.create(evaluated);
			const result = validate(instance, subSchema, draft, lookup, shortCircuit, $recursiveAnchor === true ? recursiveAnchor : null, instanceLocation, `${keywordLocation}/${i}`, subEvaluated);
			errors.push(...result.errors);
			allValid = allValid && result.valid;
			if (result.valid) subEvaluateds.push(subEvaluated);
		}
		if (allValid) errors.length = errorsLength;
		else errors.splice(errorsLength, 0, {
			instanceLocation,
			keyword: "allOf",
			keywordLocation,
			error: `Instance does not match every subschema.`
		});
	}
	if ($oneOf !== void 0) {
		const keywordLocation = `${schemaLocation}/oneOf`;
		const errorsLength = errors.length;
		const matches = $oneOf.filter((subSchema, i) => {
			const subEvaluated = Object.create(evaluated);
			const result = validate(instance, subSchema, draft, lookup, shortCircuit, $recursiveAnchor === true ? recursiveAnchor : null, instanceLocation, `${keywordLocation}/${i}`, subEvaluated);
			errors.push(...result.errors);
			if (result.valid) subEvaluateds.push(subEvaluated);
			return result.valid;
		}).length;
		if (matches === 1) errors.length = errorsLength;
		else errors.splice(errorsLength, 0, {
			instanceLocation,
			keyword: "oneOf",
			keywordLocation,
			error: `Instance does not match exactly one subschema (${matches} matches).`
		});
	}
	if (instanceType === "object" || instanceType === "array") Object.assign(evaluated, ...subEvaluateds);
	if ($if !== void 0) {
		const keywordLocation = `${schemaLocation}/if`;
		if (validate(instance, $if, draft, lookup, shortCircuit, recursiveAnchor, instanceLocation, keywordLocation, evaluated).valid) {
			if ($then !== void 0) {
				const thenResult = validate(instance, $then, draft, lookup, shortCircuit, recursiveAnchor, instanceLocation, `${schemaLocation}/then`, evaluated);
				if (!thenResult.valid) errors.push({
					instanceLocation,
					keyword: "if",
					keywordLocation,
					error: `Instance does not match "then" schema.`
				}, ...thenResult.errors);
			}
		} else if ($else !== void 0) {
			const elseResult = validate(instance, $else, draft, lookup, shortCircuit, recursiveAnchor, instanceLocation, `${schemaLocation}/else`, evaluated);
			if (!elseResult.valid) errors.push({
				instanceLocation,
				keyword: "if",
				keywordLocation,
				error: `Instance does not match "else" schema.`
			}, ...elseResult.errors);
		}
	}
	if (instanceType === "object") {
		if ($required !== void 0) {
			for (const key of $required) if (!(key in instance)) errors.push({
				instanceLocation,
				keyword: "required",
				keywordLocation: `${schemaLocation}/required`,
				error: `Instance does not have required property "${key}".`
			});
		}
		const keys = Object.keys(instance);
		if ($minProperties !== void 0 && keys.length < $minProperties) errors.push({
			instanceLocation,
			keyword: "minProperties",
			keywordLocation: `${schemaLocation}/minProperties`,
			error: `Instance does not have at least ${$minProperties} properties.`
		});
		if ($maxProperties !== void 0 && keys.length > $maxProperties) errors.push({
			instanceLocation,
			keyword: "maxProperties",
			keywordLocation: `${schemaLocation}/maxProperties`,
			error: `Instance does not have at least ${$maxProperties} properties.`
		});
		if ($propertyNames !== void 0) {
			const keywordLocation = `${schemaLocation}/propertyNames`;
			for (const key in instance) {
				const subInstancePointer = `${instanceLocation}/${encodePointer(key)}`;
				const result = validate(key, $propertyNames, draft, lookup, shortCircuit, recursiveAnchor, subInstancePointer, keywordLocation);
				if (!result.valid) errors.push({
					instanceLocation,
					keyword: "propertyNames",
					keywordLocation,
					error: `Property name "${key}" does not match schema.`
				}, ...result.errors);
			}
		}
		if ($dependentRequired !== void 0) {
			const keywordLocation = `${schemaLocation}/dependantRequired`;
			for (const key in $dependentRequired) if (key in instance) {
				const required = $dependentRequired[key];
				for (const dependantKey of required) if (!(dependantKey in instance)) errors.push({
					instanceLocation,
					keyword: "dependentRequired",
					keywordLocation,
					error: `Instance has "${key}" but does not have "${dependantKey}".`
				});
			}
		}
		if ($dependentSchemas !== void 0) for (const key in $dependentSchemas) {
			const keywordLocation = `${schemaLocation}/dependentSchemas`;
			if (key in instance) {
				const result = validate(instance, $dependentSchemas[key], draft, lookup, shortCircuit, recursiveAnchor, instanceLocation, `${keywordLocation}/${encodePointer(key)}`, evaluated);
				if (!result.valid) errors.push({
					instanceLocation,
					keyword: "dependentSchemas",
					keywordLocation,
					error: `Instance has "${key}" but does not match dependant schema.`
				}, ...result.errors);
			}
		}
		if ($dependencies !== void 0) {
			const keywordLocation = `${schemaLocation}/dependencies`;
			for (const key in $dependencies) if (key in instance) {
				const propsOrSchema = $dependencies[key];
				if (Array.isArray(propsOrSchema)) {
					for (const dependantKey of propsOrSchema) if (!(dependantKey in instance)) errors.push({
						instanceLocation,
						keyword: "dependencies",
						keywordLocation,
						error: `Instance has "${key}" but does not have "${dependantKey}".`
					});
				} else {
					const result = validate(instance, propsOrSchema, draft, lookup, shortCircuit, recursiveAnchor, instanceLocation, `${keywordLocation}/${encodePointer(key)}`);
					if (!result.valid) errors.push({
						instanceLocation,
						keyword: "dependencies",
						keywordLocation,
						error: `Instance has "${key}" but does not match dependant schema.`
					}, ...result.errors);
				}
			}
		}
		const thisEvaluated = Object.create(null);
		let stop = false;
		if ($properties !== void 0) {
			const keywordLocation = `${schemaLocation}/properties`;
			for (const key in $properties) {
				if (!(key in instance)) continue;
				const subInstancePointer = `${instanceLocation}/${encodePointer(key)}`;
				const result = validate(instance[key], $properties[key], draft, lookup, shortCircuit, recursiveAnchor, subInstancePointer, `${keywordLocation}/${encodePointer(key)}`);
				if (result.valid) evaluated[key] = thisEvaluated[key] = true;
				else {
					stop = shortCircuit;
					errors.push({
						instanceLocation,
						keyword: "properties",
						keywordLocation,
						error: `Property "${key}" does not match schema.`
					}, ...result.errors);
					if (stop) break;
				}
			}
		}
		if (!stop && $patternProperties !== void 0) {
			const keywordLocation = `${schemaLocation}/patternProperties`;
			for (const pattern in $patternProperties) {
				const regex = new RegExp(pattern, "u");
				const subSchema = $patternProperties[pattern];
				for (const key in instance) {
					if (!regex.test(key)) continue;
					const subInstancePointer = `${instanceLocation}/${encodePointer(key)}`;
					const result = validate(instance[key], subSchema, draft, lookup, shortCircuit, recursiveAnchor, subInstancePointer, `${keywordLocation}/${encodePointer(pattern)}`);
					if (result.valid) evaluated[key] = thisEvaluated[key] = true;
					else {
						stop = shortCircuit;
						errors.push({
							instanceLocation,
							keyword: "patternProperties",
							keywordLocation,
							error: `Property "${key}" matches pattern "${pattern}" but does not match associated schema.`
						}, ...result.errors);
					}
				}
			}
		}
		if (!stop && $additionalProperties !== void 0) {
			const keywordLocation = `${schemaLocation}/additionalProperties`;
			for (const key in instance) {
				if (thisEvaluated[key]) continue;
				const subInstancePointer = `${instanceLocation}/${encodePointer(key)}`;
				const result = validate(instance[key], $additionalProperties, draft, lookup, shortCircuit, recursiveAnchor, subInstancePointer, keywordLocation);
				if (result.valid) evaluated[key] = true;
				else {
					stop = shortCircuit;
					errors.push({
						instanceLocation,
						keyword: "additionalProperties",
						keywordLocation,
						error: `Property "${key}" does not match additional properties schema.`
					}, ...result.errors);
				}
			}
		} else if (!stop && $unevaluatedProperties !== void 0) {
			const keywordLocation = `${schemaLocation}/unevaluatedProperties`;
			for (const key in instance) if (!evaluated[key]) {
				const subInstancePointer = `${instanceLocation}/${encodePointer(key)}`;
				const result = validate(instance[key], $unevaluatedProperties, draft, lookup, shortCircuit, recursiveAnchor, subInstancePointer, keywordLocation);
				if (result.valid) evaluated[key] = true;
				else errors.push({
					instanceLocation,
					keyword: "unevaluatedProperties",
					keywordLocation,
					error: `Property "${key}" does not match unevaluated properties schema.`
				}, ...result.errors);
			}
		}
	} else if (instanceType === "array") {
		if ($maxItems !== void 0 && instance.length > $maxItems) errors.push({
			instanceLocation,
			keyword: "maxItems",
			keywordLocation: `${schemaLocation}/maxItems`,
			error: `Array has too many items (${instance.length} > ${$maxItems}).`
		});
		if ($minItems !== void 0 && instance.length < $minItems) errors.push({
			instanceLocation,
			keyword: "minItems",
			keywordLocation: `${schemaLocation}/minItems`,
			error: `Array has too few items (${instance.length} < ${$minItems}).`
		});
		const length = instance.length;
		let i = 0;
		let stop = false;
		if ($prefixItems !== void 0) {
			const keywordLocation = `${schemaLocation}/prefixItems`;
			const length2 = Math.min($prefixItems.length, length);
			for (; i < length2; i++) {
				const result = validate(instance[i], $prefixItems[i], draft, lookup, shortCircuit, recursiveAnchor, `${instanceLocation}/${i}`, `${keywordLocation}/${i}`);
				evaluated[i] = true;
				if (!result.valid) {
					stop = shortCircuit;
					errors.push({
						instanceLocation,
						keyword: "prefixItems",
						keywordLocation,
						error: `Items did not match schema.`
					}, ...result.errors);
					if (stop) break;
				}
			}
		}
		if ($items !== void 0) {
			const keywordLocation = `${schemaLocation}/items`;
			if (Array.isArray($items)) {
				const length2 = Math.min($items.length, length);
				for (; i < length2; i++) {
					const result = validate(instance[i], $items[i], draft, lookup, shortCircuit, recursiveAnchor, `${instanceLocation}/${i}`, `${keywordLocation}/${i}`);
					evaluated[i] = true;
					if (!result.valid) {
						stop = shortCircuit;
						errors.push({
							instanceLocation,
							keyword: "items",
							keywordLocation,
							error: `Items did not match schema.`
						}, ...result.errors);
						if (stop) break;
					}
				}
			} else for (; i < length; i++) {
				const result = validate(instance[i], $items, draft, lookup, shortCircuit, recursiveAnchor, `${instanceLocation}/${i}`, keywordLocation);
				evaluated[i] = true;
				if (!result.valid) {
					stop = shortCircuit;
					errors.push({
						instanceLocation,
						keyword: "items",
						keywordLocation,
						error: `Items did not match schema.`
					}, ...result.errors);
					if (stop) break;
				}
			}
			if (!stop && $additionalItems !== void 0) {
				const keywordLocation = `${schemaLocation}/additionalItems`;
				for (; i < length; i++) {
					const result = validate(instance[i], $additionalItems, draft, lookup, shortCircuit, recursiveAnchor, `${instanceLocation}/${i}`, keywordLocation);
					evaluated[i] = true;
					if (!result.valid) {
						stop = shortCircuit;
						errors.push({
							instanceLocation,
							keyword: "additionalItems",
							keywordLocation,
							error: `Items did not match additional items schema.`
						}, ...result.errors);
					}
				}
			}
		}
		if ($contains !== void 0) if (length === 0 && $minContains === void 0) errors.push({
			instanceLocation,
			keyword: "contains",
			keywordLocation: `${schemaLocation}/contains`,
			error: `Array is empty. It must contain at least one item matching the schema.`
		});
		else if ($minContains !== void 0 && length < $minContains) errors.push({
			instanceLocation,
			keyword: "minContains",
			keywordLocation: `${schemaLocation}/minContains`,
			error: `Array has less items (${length}) than minContains (${$minContains}).`
		});
		else {
			const keywordLocation = `${schemaLocation}/contains`;
			const errorsLength = errors.length;
			let contained = 0;
			for (let j = 0; j < length; j++) {
				const result = validate(instance[j], $contains, draft, lookup, shortCircuit, recursiveAnchor, `${instanceLocation}/${j}`, keywordLocation);
				if (result.valid) {
					evaluated[j] = true;
					contained++;
				} else errors.push(...result.errors);
			}
			if (contained >= ($minContains || 0)) errors.length = errorsLength;
			if ($minContains === void 0 && $maxContains === void 0 && contained === 0) errors.splice(errorsLength, 0, {
				instanceLocation,
				keyword: "contains",
				keywordLocation,
				error: `Array does not contain item matching schema.`
			});
			else if ($minContains !== void 0 && contained < $minContains) errors.push({
				instanceLocation,
				keyword: "minContains",
				keywordLocation: `${schemaLocation}/minContains`,
				error: `Array must contain at least ${$minContains} items matching schema. Only ${contained} items were found.`
			});
			else if ($maxContains !== void 0 && contained > $maxContains) errors.push({
				instanceLocation,
				keyword: "maxContains",
				keywordLocation: `${schemaLocation}/maxContains`,
				error: `Array may contain at most ${$maxContains} items matching schema. ${contained} items were found.`
			});
		}
		if (!stop && $unevaluatedItems !== void 0) {
			const keywordLocation = `${schemaLocation}/unevaluatedItems`;
			for (; i < length; i++) {
				if (evaluated[i]) continue;
				const result = validate(instance[i], $unevaluatedItems, draft, lookup, shortCircuit, recursiveAnchor, `${instanceLocation}/${i}`, keywordLocation);
				evaluated[i] = true;
				if (!result.valid) errors.push({
					instanceLocation,
					keyword: "unevaluatedItems",
					keywordLocation,
					error: `Items did not match unevaluated items schema.`
				}, ...result.errors);
			}
		}
		if ($uniqueItems) for (let j = 0; j < length; j++) {
			const a = instance[j];
			const ao = typeof a === "object" && a !== null;
			for (let k = 0; k < length; k++) {
				if (j === k) continue;
				const b = instance[k];
				if (a === b || ao && typeof b === "object" && b !== null && deepCompareStrict(a, b)) {
					errors.push({
						instanceLocation,
						keyword: "uniqueItems",
						keywordLocation: `${schemaLocation}/uniqueItems`,
						error: `Duplicate items at indexes ${j} and ${k}.`
					});
					j = Number.MAX_SAFE_INTEGER;
					k = Number.MAX_SAFE_INTEGER;
				}
			}
		}
	} else if (instanceType === "number") {
		if (draft === "4") {
			if ($minimum !== void 0 && ($exclusiveMinimum === true && instance <= $minimum || instance < $minimum)) errors.push({
				instanceLocation,
				keyword: "minimum",
				keywordLocation: `${schemaLocation}/minimum`,
				error: `${instance} is less than ${$exclusiveMinimum ? "or equal to " : ""} ${$minimum}.`
			});
			if ($maximum !== void 0 && ($exclusiveMaximum === true && instance >= $maximum || instance > $maximum)) errors.push({
				instanceLocation,
				keyword: "maximum",
				keywordLocation: `${schemaLocation}/maximum`,
				error: `${instance} is greater than ${$exclusiveMaximum ? "or equal to " : ""} ${$maximum}.`
			});
		} else {
			if ($minimum !== void 0 && instance < $minimum) errors.push({
				instanceLocation,
				keyword: "minimum",
				keywordLocation: `${schemaLocation}/minimum`,
				error: `${instance} is less than ${$minimum}.`
			});
			if ($maximum !== void 0 && instance > $maximum) errors.push({
				instanceLocation,
				keyword: "maximum",
				keywordLocation: `${schemaLocation}/maximum`,
				error: `${instance} is greater than ${$maximum}.`
			});
			if ($exclusiveMinimum !== void 0 && instance <= $exclusiveMinimum) errors.push({
				instanceLocation,
				keyword: "exclusiveMinimum",
				keywordLocation: `${schemaLocation}/exclusiveMinimum`,
				error: `${instance} is less than ${$exclusiveMinimum}.`
			});
			if ($exclusiveMaximum !== void 0 && instance >= $exclusiveMaximum) errors.push({
				instanceLocation,
				keyword: "exclusiveMaximum",
				keywordLocation: `${schemaLocation}/exclusiveMaximum`,
				error: `${instance} is greater than or equal to ${$exclusiveMaximum}.`
			});
		}
		if ($multipleOf !== void 0) {
			const remainder = instance % $multipleOf;
			if (Math.abs(0 - remainder) >= 1.1920929e-7 && Math.abs($multipleOf - remainder) >= 1.1920929e-7) errors.push({
				instanceLocation,
				keyword: "multipleOf",
				keywordLocation: `${schemaLocation}/multipleOf`,
				error: `${instance} is not a multiple of ${$multipleOf}.`
			});
		}
	} else if (instanceType === "string") {
		const length = $minLength === void 0 && $maxLength === void 0 ? 0 : ucs2length(instance);
		if ($minLength !== void 0 && length < $minLength) errors.push({
			instanceLocation,
			keyword: "minLength",
			keywordLocation: `${schemaLocation}/minLength`,
			error: `String is too short (${length} < ${$minLength}).`
		});
		if ($maxLength !== void 0 && length > $maxLength) errors.push({
			instanceLocation,
			keyword: "maxLength",
			keywordLocation: `${schemaLocation}/maxLength`,
			error: `String is too long (${length} > ${$maxLength}).`
		});
		if ($pattern !== void 0 && !new RegExp($pattern, "u").test(instance)) errors.push({
			instanceLocation,
			keyword: "pattern",
			keywordLocation: `${schemaLocation}/pattern`,
			error: `String does not match pattern.`
		});
		if ($format !== void 0 && format[$format] && !format[$format](instance)) errors.push({
			instanceLocation,
			keyword: "format",
			keywordLocation: `${schemaLocation}/format`,
			error: `String does not match format "${$format}".`
		});
	}
	return {
		valid: errors.length === 0,
		errors
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/validator.js
var Validator = class {
	schema;
	draft;
	shortCircuit;
	lookup;
	constructor(schema, draft = "2019-09", shortCircuit = true) {
		this.schema = schema;
		this.draft = draft;
		this.shortCircuit = shortCircuit;
		this.lookup = dereference(schema);
	}
	validate(instance) {
		return validate(instance, this.schema, this.draft, this.lookup, this.shortCircuit);
	}
	addSchema(schema, id) {
		if (id) schema = {
			...schema,
			$id: id
		};
		dereference(schema, this.lookup);
	}
};
//#endregion
//#region ../../node_modules/.pnpm/@mcp-b+webmcp-polyfill@2.3.2/node_modules/@mcp-b/webmcp-polyfill/dist/index.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_client = require_client();
var FAILED_TO_PARSE_INPUT_ARGUMENTS_MESSAGE = "Failed to parse input arguments";
var TOOL_INVOCATION_FAILED_MESSAGE = "Tool was executed but the invocation failed. For example, the script function threw an error";
var TOOL_CANCELLED_MESSAGE = "Tool was cancelled";
var DEFAULT_INPUT_SCHEMA = {
	type: "object",
	properties: {}
};
var STANDARD_JSON_SCHEMA_TARGETS = ["draft-2020-12", "draft-07"];
var POLYFILL_MARKER_PROPERTY = "__isWebMCPPolyfill";
var STANDARD_VALIDATOR_SYMBOL = Symbol("standardValidator");
var installState = {
	installed: false,
	previousModelContextDescriptor: void 0,
	previousModelContextTestingDescriptor: void 0
};
var StrictWebMCPContext = class extends EventTarget {
	tools = /* @__PURE__ */ new Map();
	testingShim = null;
	_ontoolchange = null;
	provideContextDeprecationWarned = false;
	clearContextDeprecationWarned = false;
	unregisterToolDeprecationWarned = false;
	get ontoolchange() {
		return this._ontoolchange;
	}
	set ontoolchange(handler) {
		this._ontoolchange = handler;
	}
	provideContext(options = {}) {
		this.warnProvideContextDeprecationOnce();
		const nextTools = /* @__PURE__ */ new Map();
		for (const tool of options.tools ?? []) {
			const normalized = normalizeToolDescriptor(tool, nextTools);
			nextTools.set(normalized.name, normalized);
		}
		this.tools = nextTools;
		this.notifyToolsChanged();
	}
	clearContext() {
		this.warnClearContextDeprecationOnce();
		this.tools.clear();
		this.notifyToolsChanged();
	}
	registerTool(tool, options) {
		const signal = options?.signal;
		if (signal?.aborted) {
			console.warn(`[WebMCPPolyfill] registerTool("${tool?.name ?? "<unknown>"}") skipped: options.signal was already aborted.`);
			return;
		}
		const normalized = normalizeToolDescriptor(tool, this.tools);
		this.tools.set(normalized.name, normalized);
		this.notifyToolsChanged();
		if (signal) signal.addEventListener("abort", () => {
			if (this.tools.delete(normalized.name)) this.notifyToolsChanged();
		}, { once: true });
	}
	unregisterTool(nameOrTool) {
		this.warnUnregisterToolDeprecationOnce();
		const name = getToolNameForUnregister(nameOrTool);
		if (this.tools.delete(name)) this.notifyToolsChanged();
	}
	getTools() {
		return this.getToolInfos();
	}
	getTestingShim() {
		if (!this.testingShim) this.testingShim = new PolyfillTestingShim(this);
		return this.testingShim;
	}
	/** @internal Used by PolyfillTestingShim */
	getToolInfos() {
		return [...this.tools.values()].map((tool) => {
			let inputSchema;
			try {
				inputSchema = JSON.stringify(tool.inputSchema ?? { type: "object" });
			} catch {
				inputSchema = "{\"type\":\"object\"}";
			}
			return {
				name: tool.name,
				description: tool.description,
				inputSchema
			};
		});
	}
	/** @internal Used by PolyfillTestingShim */
	async executeToolForTesting(toolName, inputArgsJson, options) {
		if (options?.signal?.aborted) throw createUnknownError(TOOL_CANCELLED_MESSAGE);
		const tool = this.tools.get(toolName);
		if (!tool) throw createUnknownError(`Tool not found: ${toolName}`);
		const args = parseInputArgsJson(inputArgsJson);
		const validationError = await validateArgsForTool(args, tool);
		if (validationError) throw createUnknownError(validationError);
		let contextActive = true;
		const client = { requestUserInteraction: async (callback) => {
			if (!contextActive) throw new Error(`ModelContextClient for tool "${toolName}" is no longer active after execute() resolved`);
			if (typeof callback !== "function") throw new TypeError("requestUserInteraction(callback) requires a function callback");
			return callback();
		} };
		try {
			const execution = tool.execute(args, client);
			return toSerializedTestingResult(normalizeToolResponse(await withAbortSignal(Promise.resolve(execution), options?.signal)));
		} catch (error) {
			throw createUnknownError(error instanceof Error ? `${TOOL_INVOCATION_FAILED_MESSAGE}: ${error.message}` : TOOL_INVOCATION_FAILED_MESSAGE);
		} finally {
			contextActive = false;
		}
	}
	notifyToolsChanged() {
		queueMicrotask(() => {
			const event = new Event("toolchange");
			try {
				this._ontoolchange?.call(this, event);
			} catch (error) {
				console.warn("[WebMCPPolyfill] navigator.modelContext.ontoolchange handler threw:", error);
			}
			this.dispatchEvent(event);
			this.testingShim?.dispatchToolChange();
		});
	}
	warnProvideContextDeprecationOnce() {
		if (this.provideContextDeprecationWarned) return;
		this.provideContextDeprecationWarned = true;
		console.warn("[WebMCPPolyfill] navigator.modelContext.provideContext() is deprecated and will be removed in the next major version. Register tools individually with registerTool() instead.");
	}
	warnClearContextDeprecationOnce() {
		if (this.clearContextDeprecationWarned) return;
		this.clearContextDeprecationWarned = true;
		console.warn("[WebMCPPolyfill] navigator.modelContext.clearContext() is deprecated and will be removed in the next major version. Unregister individual tools instead.");
	}
	warnUnregisterToolDeprecationOnce() {
		if (this.unregisterToolDeprecationWarned) return;
		this.unregisterToolDeprecationWarned = true;
		console.warn("[WebMCPPolyfill] navigator.modelContext.unregisterTool() is deprecated. The April 23, 2026 WebMCP draft removed it in favor of registerTool(tool, { signal }) — pass an AbortSignal and abort it to unregister.");
	}
};
/**
* EventTarget-based testing shim matching the native Chromium ModelContextTesting surface.
*
* Fires `toolchange` events and supports the `ontoolchange` handler property,
* matching the native Chromium 148 API. The deprecated `registerToolsChangedCallback`
* is kept as a compat layer that wraps `addEventListener`.
*/
var PolyfillTestingShim = class extends EventTarget {
	context;
	_ontoolchange = null;
	constructor(context) {
		super();
		this.context = context;
	}
	listTools() {
		return this.context.getToolInfos();
	}
	executeTool(toolName, inputArgsJson, options) {
		return this.context.executeToolForTesting(toolName, inputArgsJson, options);
	}
	getCrossDocumentScriptToolResult() {
		return Promise.resolve("[]");
	}
	get ontoolchange() {
		return this._ontoolchange;
	}
	set ontoolchange(handler) {
		this._ontoolchange = handler;
	}
	/**
	* @deprecated Use `addEventListener('toolchange', callback)` instead.
	* Kept for backward compatibility with older polyfill consumers.
	*/
	registerToolsChangedCallback(callback) {
		if (typeof callback !== "function") throw new TypeError("Failed to execute 'registerToolsChangedCallback' on 'ModelContextTesting': parameter 1 is not of type 'Function'.");
		this.addEventListener("toolchange", callback);
	}
	/** @internal Called by StrictWebMCPContext when tools change. */
	dispatchToolChange() {
		const event = new Event("toolchange");
		try {
			this._ontoolchange?.call(this, event);
		} catch (error) {
			console.warn("[WebMCPPolyfill] ontoolchange handler threw:", error);
		}
		this.dispatchEvent(event);
		this.dispatchEvent(new Event("toolschanged"));
	}
};
function createUnknownError(message) {
	try {
		return new DOMException(message, "UnknownError");
	} catch {
		const error = new Error(message);
		error.name = "UnknownError";
		return error;
	}
}
function parseInputArgsJson(inputArgsJson) {
	let parsed;
	try {
		parsed = JSON.parse(inputArgsJson);
	} catch {
		throw createUnknownError(FAILED_TO_PARSE_INPUT_ARGUMENTS_MESSAGE);
	}
	if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw createUnknownError(FAILED_TO_PARSE_INPUT_ARGUMENTS_MESSAGE);
	return parsed;
}
function getToolNameForUnregister(nameOrTool) {
	if (typeof nameOrTool === "string") return nameOrTool;
	if (isPlainObject(nameOrTool) && typeof nameOrTool.name === "string") return nameOrTool.name;
	throw new TypeError("Failed to execute 'unregisterTool' on 'ModelContext': parameter 1 must be a string or an object with a string name.");
}
function isPlainObject(value) {
	return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function getStandardProps(value) {
	if (!isPlainObject(value)) return null;
	const standard = value["~standard"];
	if (!isPlainObject(standard)) return null;
	return standard;
}
function isStandardInputValidatorSchema(value) {
	const standard = getStandardProps(value);
	return Boolean(standard && standard.version === 1 && typeof standard.validate === "function");
}
function isStandardInputJsonSchema(value) {
	const standard = getStandardProps(value);
	if (!standard || standard.version !== 1 || !isPlainObject(standard.jsonSchema)) return false;
	return typeof standard.jsonSchema.input === "function";
}
function createStandardValidatorFromJsonSchema(schema) {
	return { "~standard": {
		version: 1,
		vendor: "@mcp-b/webmcp-polyfill-json-schema",
		validate(value) {
			if (!isPlainObject(value)) return { issues: [{ message: "expected object arguments" }] };
			const issue = validateArgsWithSchema(value, schema);
			if (issue) return { issues: [issue] };
			return { value };
		}
	} };
}
function convertStandardInputSchema(schema) {
	for (const target of STANDARD_JSON_SCHEMA_TARGETS) try {
		const converted = schema["~standard"].jsonSchema.input({ target });
		validateInputSchema(converted);
		return converted;
	} catch (error) {
		console.warn(`[WebMCPPolyfill] Standard JSON Schema conversion failed for target "${target}":`, error);
	}
	throw new Error("Failed to convert Standard JSON Schema inputSchema to a JSON Schema object");
}
function normalizeInputSchema(inputSchema) {
	if (inputSchema === void 0) {
		const normalized = DEFAULT_INPUT_SCHEMA;
		return {
			inputSchema: normalized,
			standardValidator: createStandardValidatorFromJsonSchema(normalized)
		};
	}
	if (isStandardInputJsonSchema(inputSchema)) {
		const converted = convertStandardInputSchema(inputSchema);
		return {
			inputSchema: converted,
			standardValidator: createStandardValidatorFromJsonSchema(converted)
		};
	}
	if (isStandardInputValidatorSchema(inputSchema)) return {
		inputSchema: DEFAULT_INPUT_SCHEMA,
		standardValidator: inputSchema
	};
	validateInputSchema(inputSchema);
	if (Object.keys(inputSchema).length === 0) return {
		inputSchema: DEFAULT_INPUT_SCHEMA,
		standardValidator: createStandardValidatorFromJsonSchema(DEFAULT_INPUT_SCHEMA)
	};
	const normalizedSchema = inputSchema.type === void 0 ? {
		type: "object",
		...inputSchema
	} : inputSchema;
	return {
		inputSchema: normalizedSchema,
		standardValidator: createStandardValidatorFromJsonSchema(normalizedSchema)
	};
}
function validateInputSchema(schema) {
	if (!isPlainObject(schema)) throw new Error("inputSchema must be a JSON Schema object");
	validateJsonSchemaNode(schema, "$");
}
function validateJsonSchemaNode(node, path) {
	const typeValue = node.type;
	if (typeValue !== void 0 && typeof typeValue !== "string" && !(Array.isArray(typeValue) && typeValue.every((entry) => typeof entry === "string" && entry.length > 0))) throw new Error(`Invalid JSON Schema at ${path}: "type" must be a string or string[]`);
	const requiredValue = node.required;
	if (requiredValue !== void 0 && !(Array.isArray(requiredValue) && requiredValue.every((entry) => typeof entry === "string"))) throw new Error(`Invalid JSON Schema at ${path}: "required" must be an array of strings`);
	const propertiesValue = node.properties;
	if (propertiesValue !== void 0) {
		if (!isPlainObject(propertiesValue)) throw new Error(`Invalid JSON Schema at ${path}: "properties" must be an object`);
		for (const [key, value] of Object.entries(propertiesValue)) {
			if (!isPlainObject(value)) throw new Error(`Invalid JSON Schema at ${path}.properties.${key}: expected object schema`);
			validateJsonSchemaNode(value, `${path}.properties.${key}`);
		}
	}
	const itemsValue = node.items;
	if (itemsValue !== void 0) if (Array.isArray(itemsValue)) for (const [index, value] of itemsValue.entries()) {
		if (!isPlainObject(value)) throw new Error(`Invalid JSON Schema at ${path}.items[${index}]: expected object schema`);
		validateJsonSchemaNode(value, `${path}.items[${index}]`);
	}
	else if (isPlainObject(itemsValue)) validateJsonSchemaNode(itemsValue, `${path}.items`);
	else throw new Error(`Invalid JSON Schema at ${path}: "items" must be an object or object[]`);
	for (const keyword of [
		"allOf",
		"anyOf",
		"oneOf"
	]) {
		const value = node[keyword];
		if (value === void 0) continue;
		if (!Array.isArray(value)) throw new Error(`Invalid JSON Schema at ${path}: "${keyword}" must be an array`);
		for (const [index, entry] of value.entries()) {
			if (!isPlainObject(entry)) throw new Error(`Invalid JSON Schema at ${path}.${keyword}[${index}]: expected object schema`);
			validateJsonSchemaNode(entry, `${path}.${keyword}[${index}]`);
		}
	}
	const notValue = node.not;
	if (notValue !== void 0) {
		if (!isPlainObject(notValue)) throw new Error(`Invalid JSON Schema at ${path}: "not" must be an object schema`);
		validateJsonSchemaNode(notValue, `${path}.not`);
	}
	try {
		JSON.stringify(node);
	} catch {
		throw new Error(`Invalid JSON Schema at ${path}: schema must be JSON-serializable`);
	}
}
function normalizeToolDescriptor(tool, existing) {
	if (!tool || typeof tool !== "object") throw new TypeError("registerTool(tool) requires a tool object");
	if (typeof tool.name !== "string" || tool.name.length === 0) throw new TypeError("Tool \"name\" must be a non-empty string");
	if (typeof tool.description !== "string" || tool.description.length === 0) throw new TypeError("Tool \"description\" must be a non-empty string");
	if (typeof tool.execute !== "function") throw new TypeError("Tool \"execute\" must be a function");
	if (existing.has(tool.name)) throw new Error(`Tool already registered: ${tool.name}`);
	const normalizedInputSchema = normalizeInputSchema(tool.inputSchema);
	const annotations = tool.annotations;
	const normalizedAnnotations = annotations ? {
		...annotations,
		...annotations.readOnlyHint === "true" ? { readOnlyHint: true } : annotations.readOnlyHint === "false" ? { readOnlyHint: false } : {},
		...annotations.destructiveHint === "true" ? { destructiveHint: true } : annotations.destructiveHint === "false" ? { destructiveHint: false } : {},
		...annotations.idempotentHint === "true" ? { idempotentHint: true } : annotations.idempotentHint === "false" ? { idempotentHint: false } : {},
		...annotations.openWorldHint === "true" ? { openWorldHint: true } : annotations.openWorldHint === "false" ? { openWorldHint: false } : {}
	} : void 0;
	return {
		...tool,
		...normalizedAnnotations ? { annotations: normalizedAnnotations } : {},
		inputSchema: normalizedInputSchema.inputSchema,
		[STANDARD_VALIDATOR_SYMBOL]: normalizedInputSchema.standardValidator
	};
}
function validateArgsWithSchema(args, schema) {
	const result = new Validator(schema, "2020-12", true).validate(args);
	if (result.valid) return null;
	const error = result.errors[result.errors.length - 1];
	if (!error) return { message: "Input validation failed" };
	return { message: error.error };
}
function formatStandardIssuePath(path) {
	if (!path || path.length === 0) return null;
	const segments = path.map((segment) => {
		if (isPlainObject(segment) && "key" in segment) return segment.key;
		return segment;
	}).map((segment) => String(segment)).filter((segment) => segment.length > 0);
	if (segments.length === 0) return null;
	return segments.join(".");
}
async function validateArgsWithStandardSchema(args, schema) {
	let result;
	try {
		result = await Promise.resolve(schema["~standard"].validate(args));
	} catch (error) {
		const detail = error instanceof Error ? `: ${error.message}` : "";
		console.error("[WebMCPPolyfill] Standard Schema validation threw unexpectedly:", error);
		return `Input validation error: schema validation failed${detail}`;
	}
	if (!result.issues || result.issues.length === 0) return null;
	const firstIssue = result.issues[0];
	if (!firstIssue) return "Input validation error";
	const path = formatStandardIssuePath(firstIssue?.path);
	if (path) return `Input validation error: ${firstIssue.message} at ${path}`;
	return `Input validation error: ${firstIssue.message}`;
}
async function validateArgsForTool(args, tool) {
	return validateArgsWithStandardSchema(args, tool[STANDARD_VALIDATOR_SYMBOL]);
}
function isCallToolResult(value) {
	return isPlainObject(value) && Array.isArray(value.content);
}
function isJsonPrimitive(value) {
	return value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}
function isJsonValue(value) {
	if (isJsonPrimitive(value)) return Number.isFinite(value) || typeof value !== "number";
	if (Array.isArray(value)) return value.every((entry) => isJsonValue(entry));
	if (!isPlainObject(value)) return false;
	return Object.values(value).every((entry) => isJsonValue(entry));
}
function toStructuredContent(value) {
	if (!isPlainObject(value) || !isJsonValue(value)) return;
	return value;
}
function serializeTextContent(value) {
	if (typeof value === "string") return value;
	try {
		return JSON.stringify(value) ?? String(value);
	} catch {
		return String(value);
	}
}
function normalizeToolResponse(value) {
	if (isCallToolResult(value)) return value;
	const structuredContent = toStructuredContent(value);
	return {
		content: [{
			type: "text",
			text: serializeTextContent(value)
		}],
		...structuredContent ? { structuredContent } : {},
		isError: false
	};
}
function getFirstTextBlock(result) {
	for (const block of result.content ?? []) if (block.type === "text" && "text" in block && typeof block.text === "string") return block.text;
	return null;
}
function toSerializedTestingResult(result) {
	if (result.isError) throw createUnknownError(getFirstTextBlock(result)?.replace(/^Error:\s*/i, "").trim() || TOOL_INVOCATION_FAILED_MESSAGE);
	const metadata = result.metadata;
	if (metadata && typeof metadata === "object" && metadata.willNavigate) return null;
	try {
		return JSON.stringify(result);
	} catch {
		throw createUnknownError(TOOL_INVOCATION_FAILED_MESSAGE);
	}
}
function withAbortSignal(operation, signal) {
	if (!signal) return operation;
	if (signal.aborted) return Promise.reject(createUnknownError(TOOL_CANCELLED_MESSAGE));
	return new Promise((resolve, reject) => {
		const onAbort = () => {
			cleanup();
			reject(createUnknownError(TOOL_CANCELLED_MESSAGE));
		};
		const cleanup = () => {
			signal.removeEventListener("abort", onAbort);
		};
		signal.addEventListener("abort", onAbort, { once: true });
		operation.then((value) => {
			cleanup();
			resolve(value);
		}, (error) => {
			cleanup();
			reject(error);
		});
	});
}
function getNavigator() {
	if (typeof navigator !== "undefined") return navigator;
	return null;
}
function defineNavigatorProperty(target, key, value) {
	Object.defineProperty(target, key, {
		configurable: true,
		enumerable: true,
		writable: false,
		value
	});
}
function initializeWebMCPPolyfill(options) {
	const nav = getNavigator();
	if (!nav) return;
	if (Boolean(nav.modelContext)) return;
	if (installState.installed) cleanupWebMCPPolyfill();
	const context = new StrictWebMCPContext();
	const modelContext = context;
	modelContext[POLYFILL_MARKER_PROPERTY] = true;
	installState.previousModelContextDescriptor = Object.getOwnPropertyDescriptor(nav, "modelContext");
	installState.previousModelContextTestingDescriptor = Object.getOwnPropertyDescriptor(nav, "modelContextTesting");
	defineNavigatorProperty(nav, "modelContext", modelContext);
	const installTestingShim = options?.installTestingShim ?? "if-missing";
	const hasModelContextTesting = Boolean(nav.modelContextTesting);
	if (installTestingShim === "always" || (installTestingShim === true || installTestingShim === "if-missing") && !hasModelContextTesting) defineNavigatorProperty(nav, "modelContextTesting", context.getTestingShim());
	installState.installed = true;
}
function cleanupWebMCPPolyfill() {
	const nav = getNavigator();
	if (!nav || !installState.installed) return;
	const restore = (key, previousDescriptor) => {
		if (previousDescriptor) {
			Object.defineProperty(nav, key, previousDescriptor);
			return;
		}
		delete nav[key];
	};
	restore("modelContext", installState.previousModelContextDescriptor);
	restore("modelContextTesting", installState.previousModelContextTestingDescriptor);
	installState.installed = false;
	installState.previousModelContextDescriptor = void 0;
	installState.previousModelContextTestingDescriptor = void 0;
}
if (typeof window !== "undefined" && typeof document !== "undefined") {
	const options = window.__webMCPPolyfillOptions;
	if (options?.autoInitialize !== false) try {
		initializeWebMCPPolyfill(options);
	} catch (error) {
		console.error("[WebMCPPolyfill] Auto-initialization failed:", error);
	}
}
//#endregion
//#region ../../packages/webmcp-sdk/dist/index.js
var modelContextPatched = false;
function patchModelContextEventSupport() {
	if (modelContextPatched) return;
	if (typeof navigator === "undefined" || !("modelContext" in navigator) || !navigator.modelContext) return;
	const mc = navigator.modelContext;
	const hasEventTarget = typeof mc.addEventListener === "function";
	const hasListTools = typeof mc.listTools === "function";
	const hasCallTool = typeof mc.callTool === "function";
	if (hasEventTarget && hasListTools && hasCallTool) {
		modelContextPatched = true;
		return;
	}
	if (!hasEventTarget) {
		const listeners = /* @__PURE__ */ new Map();
		mc.addEventListener = (type, callback) => {
			if (!listeners.has(type)) listeners.set(type, /* @__PURE__ */ new Set());
			listeners.get(type).add(callback);
		};
		mc.removeEventListener = (type, callback) => {
			listeners.get(type)?.delete(callback);
		};
		mc.dispatchEvent = (event) => {
			const set = listeners.get(event.type);
			if (set) set.forEach((fn) => {
				try {
					fn.call(mc, event);
				} catch {}
			});
			return true;
		};
	}
	if (!hasListTools || !hasCallTool) {
		const testing = navigator.modelContextTesting;
		if (testing) {
			if (typeof testing.listTools === "function" && !testing.__webmcpNexusListToolsPatched) {
				const originalTestingListTools = testing.listTools.bind(testing);
				testing.listTools = (...args) => {
					const nativeTools = originalTestingListTools(...args);
					return Array.isArray(nativeTools) ? nativeTools.filter((tool) => {
						if (!managedToolNames.has(tool.name)) return true;
						return activeTools.has(tool.name);
					}) : nativeTools;
				};
				testing.__webmcpNexusListToolsPatched = true;
			}
			if (!hasListTools && typeof testing.listTools === "function") mc.listTools = () => {
				try {
					return testing.listTools().map((t) => ({
						name: t.name,
						description: t.description || "",
						inputSchema: typeof t.inputSchema === "string" && t.inputSchema.length > 0 ? JSON.parse(t.inputSchema) : {
							type: "object",
							properties: {}
						}
					}));
				} catch {
					return [];
				}
			};
			if (!hasCallTool && typeof testing.executeTool === "function") mc.callTool = async (params) => {
				const result = await testing.executeTool(params.name, JSON.stringify(params.arguments || {}));
				if (result === null) return {
					isError: true,
					content: [{
						type: "text",
						text: "Tool execution interrupted by navigation"
					}]
				};
				try {
					return JSON.parse(result);
				} catch {
					throw new Error(`Tool returned invalid JSON: ${String(result).slice(0, 200)}`);
				}
			};
		}
	}
	if (typeof mc.registerTool === "function") {
		const originalRegisterTool = mc.registerTool.bind(mc);
		mc.registerTool = (tool, options) => {
			let registrationError;
			try {
				originalRegisterTool(tool, options);
			} catch (error) {
				registrationError = error;
			}
			try {
				mc.dispatchEvent(new Event("toolchange"));
			} catch {}
			if (registrationError) throw registrationError;
		};
	}
	if (typeof mc.unregisterTool === "function") {
		const originalUnregisterTool = mc.unregisterTool.bind(mc);
		mc.unregisterTool = (name) => {
			try {
				originalUnregisterTool(name);
			} catch {}
			try {
				mc.dispatchEvent(new Event("toolchange"));
			} catch {}
		};
	}
	modelContextPatched = true;
}
var registry = /* @__PURE__ */ new Map();
var activeTools = /* @__PURE__ */ new Map();
var managedToolNames = /* @__PURE__ */ new Set();
var hasManagedTools = false;
function getOwnerKey(owner) {
	return `${owner.scope}:${owner.scopeId}`;
}
function getActiveToolConfigs() {
	return Array.from(activeTools.values()).map((record) => ({
		name: record.name,
		description: record.config.description,
		inputSchema: record.config.inputSchema || {
			type: "object",
			properties: {}
		}
	}));
}
function registerEntry(name, scope, scopeId) {
	const entries = registry.get(name) || [];
	if (entries.length > 0) {
		if (!entries.some((e) => e.scope === scope && e.scopeId === scopeId)) {
			const existing = entries[0];
			console.warn(`[webmcp] Tool "${name}" is already registered by scope "${existing.scope}:${existing.scopeId}". Re-registering from "${scope}:${scopeId}". This may cause unexpected behavior.`);
		}
	}
	entries.push({
		name,
		scope,
		scopeId
	});
	registry.set(name, entries);
}
function registerScopedTool(toolConfig, owner) {
	try {
		const ownerKey = getOwnerKey(owner);
		hasManagedTools = true;
		managedToolNames.add(toolConfig.name);
		const existing = activeTools.get(toolConfig.name);
		if (existing) {
			existing.owners.set(ownerKey, owner);
			existing.configs.set(ownerKey, toolConfig);
			return;
		}
		const controller = new AbortController();
		const owners = /* @__PURE__ */ new Map([[ownerKey, owner]]);
		const record = {
			name: toolConfig.name,
			config: toolConfig,
			configs: /* @__PURE__ */ new Map([[ownerKey, toolConfig]]),
			controller,
			owners,
			nativeRegistered: false
		};
		activeTools.set(toolConfig.name, record);
		const mc = typeof navigator !== "undefined" ? navigator.modelContext : void 0;
		controller.signal.addEventListener("abort", () => {
			try {
				if (mc && typeof mc.unregisterTool === "function" && !mc.__isWebMCPPolyfill) mc.unregisterTool(toolConfig.name);
			} catch {}
			try {
				activeTools.delete(toolConfig.name);
				notifyToolsChanged();
			} catch {}
		}, { once: true });
		if (mc && typeof mc.registerTool === "function") {
			const nativeToolConfig = {
				...toolConfig,
				execute: async (input) => {
					return activeTools.get(toolConfig.name)?.config.execute(input);
				}
			};
			try {
				mc.registerTool(nativeToolConfig, { signal: controller.signal });
				record.nativeRegistered = true;
			} catch {
				try {
					if (typeof mc.unregisterTool === "function") {
						mc.unregisterTool(toolConfig.name);
						mc.registerTool(nativeToolConfig, { signal: controller.signal });
						record.nativeRegistered = true;
					}
				} catch {}
			}
		}
	} catch {}
}
function unregisterScopedTool(name, owner) {
	try {
		const record = activeTools.get(name);
		if (!record) return false;
		const ownerKey = getOwnerKey(owner);
		const removedConfig = record.configs.get(ownerKey);
		record.owners.delete(ownerKey);
		record.configs.delete(ownerKey);
		if (removedConfig && record.config === removedConfig) {
			const nextConfig = record.configs.values().next().value;
			if (nextConfig) record.config = nextConfig;
		}
		if (record.owners.size > 0) return false;
		if (!record.controller.signal.aborted) {
			record.controller.abort();
			notifyToolsChanged({ immediate: true });
		} else {
			activeTools.delete(name);
			notifyToolsChanged({ immediate: true });
		}
		return true;
	} catch {
		return false;
	}
}
var pushToolsTimer = null;
function pushToolsToWidget() {
	try {
		const tools = getToolsForWidget();
		if (typeof document === "undefined") return;
		const iframes = document.querySelectorAll("iframe");
		for (let i = 0; i < iframes.length; i++) {
			const iframe = iframes[i];
			try {
				if (iframe.contentWindow) iframe.contentWindow.postMessage({
					type: "webmcp.tools.changed",
					tools
				}, "*");
			} catch {}
		}
	} catch {}
}
function getToolsForWidget() {
	if (hasManagedTools) return getActiveToolConfigs();
	try {
		const mc = typeof navigator !== "undefined" ? navigator.modelContext : void 0;
		if (mc && typeof mc.listTools === "function") return mc.listTools().map((tool) => ({
			name: tool.name,
			description: tool.description || "",
			inputSchema: typeof tool.inputSchema === "string" && tool.inputSchema.length > 0 ? safeJsonParse(tool.inputSchema) : tool.inputSchema || {
				type: "object",
				properties: {}
			}
		}));
	} catch {}
	return getActiveToolConfigs();
}
function safeJsonParse(value) {
	try {
		return JSON.parse(value);
	} catch {
		return {
			type: "object",
			properties: {}
		};
	}
}
function schedulePushToolsToWidget() {
	if (pushToolsTimer) clearTimeout(pushToolsTimer);
	pushToolsTimer = setTimeout(() => {
		pushToolsTimer = null;
		pushToolsToWidget();
	}, 100);
}
function pushToolsToWidgetImmediately() {
	if (pushToolsTimer) {
		clearTimeout(pushToolsTimer);
		pushToolsTimer = null;
	}
	pushToolsToWidget();
}
function notifyToolsChanged(options = {}) {
	if (typeof navigator === "undefined" || !("modelContext" in navigator)) return;
	try {
		navigator.modelContext.dispatchEvent(new Event("toolschanged"));
	} catch {}
	if (options.immediate) pushToolsToWidgetImmediately();
	else schedulePushToolsToWidget();
}
var attempted = false;
function ensureModelContextPolyfill() {
	if (attempted) return;
	attempted = true;
	if (typeof navigator === "undefined") return;
	if ("modelContext" in navigator) return;
	try {
		initializeWebMCPPolyfill({ installTestingShim: true });
	} catch {}
}
function registerGlobalTools(...toolMaps) {
	ensureModelContextPolyfill();
	if (typeof navigator === "undefined" || !("modelContext" in navigator)) return;
	try {
		patchModelContextEventSupport();
		let registeredCount = 0;
		for (const toolMap of toolMaps) for (const [name, fn] of Object.entries(toolMap)) {
			if (typeof fn !== "function") continue;
			const schema = fn.__webmcpSchema;
			if (!schema) continue;
			registerEntry(name, "global", "app");
			registerScopedTool({
				name,
				description: schema.description,
				inputSchema: schema.inputSchema,
				execute: async (input) => fn(input),
				annotations: { readOnlyHint: schema.readOnly ?? false }
			}, {
				scope: "global",
				scopeId: "app"
			});
			registeredCount++;
		}
		if (registeredCount > 0) notifyToolsChanged();
	} catch {}
}
var scopeCounter = 0;
function generateScopeId() {
	return `component-${++scopeCounter}`;
}
var hmrVersion = 0;
var hmrHot = typeof import.meta !== "undefined" ? void 0 : void 0;
if (hmrHot && typeof hmrHot.on === "function") hmrHot.on("vite:afterUpdate", () => {
	hmrVersion++;
});
function useWebMcpTools(...toolMaps) {
	const merged = {};
	for (const toolMap of toolMaps) for (const [name, fn] of Object.entries(toolMap)) if (typeof fn === "function") merged[name] = fn;
	const toolsRef = (0, import_react.useRef)(merged);
	toolsRef.current = merged;
	const scopeIdRef = (0, import_react.useRef)("");
	if (!scopeIdRef.current) scopeIdRef.current = generateScopeId();
	const toolKeys = Object.keys(merged).sort().join(",");
	const [localHmrVersion, setLocalHmrVersion] = (0, import_react.useState)(hmrVersion);
	(0, import_react.useEffect)(() => {
		const hot = typeof import.meta !== "undefined" ? void 0 : void 0;
		if (hot && typeof hot.on === "function") {
			const handler = () => setLocalHmrVersion((v) => v + 1);
			hot.on("vite:afterUpdate", handler);
			return () => {
				if (typeof hot.off === "function") hot.off("vite:afterUpdate", handler);
			};
		}
	}, []);
	(0, import_react.useEffect)(() => {
		ensureModelContextPolyfill();
		if (typeof navigator === "undefined" || !("modelContext" in navigator)) return;
		patchModelContextEventSupport();
		const registeredNames = [];
		for (const [name, fn] of Object.entries(toolsRef.current)) {
			const schema = fn.__webmcpSchema;
			if (!schema) continue;
			registerScopedTool({
				name,
				description: schema.description,
				inputSchema: schema.inputSchema,
				execute: async (input) => toolsRef.current[name](input),
				annotations: { readOnlyHint: schema.readOnly ?? false }
			}, {
				scope: "component",
				scopeId: scopeIdRef.current
			});
			registeredNames.push(name);
		}
		if (registeredNames.length > 0) notifyToolsChanged();
		return () => {
			let unregisteredAny = false;
			for (const name of registeredNames) if (unregisterScopedTool(name, {
				scope: "component",
				scopeId: scopeIdRef.current
			})) unregisteredAny = true;
			if (unregisteredAny) notifyToolsChanged();
		};
	}, [toolKeys, localHmrVersion]);
}
//#endregion
//#region src/store/mockData.ts
var initialProjects = [
	{
		id: "p_inbox",
		name: "收件箱",
		color: "#94a3b8",
		description: "默认项目，临时任务先放这里"
	},
	{
		id: "p_growth",
		name: "增长实验",
		color: "#2f6f5e",
		description: "本季度 AARRR 全链路实验"
	},
	{
		id: "p_platform",
		name: "平台基建",
		color: "#c2410c",
		description: "内部工具与基础设施"
	},
	{
		id: "p_brand",
		name: "品牌升级",
		color: "#7c3aed",
		description: "品牌识别与官网刷新"
	}
];
var initialTags = [
	{
		id: "t_bug",
		name: "bug",
		color: "#dc2626"
	},
	{
		id: "t_feature",
		name: "feature",
		color: "#0ea5e9"
	},
	{
		id: "t_research",
		name: "research",
		color: "#9333ea"
	},
	{
		id: "t_design",
		name: "design",
		color: "#db2777"
	},
	{
		id: "t_urgent",
		name: "urgent",
		color: "#f97316"
	},
	{
		id: "t_docs",
		name: "docs",
		color: "#64748b"
	}
];
var daysFromNow = (n, hour = 18, minute = 0) => {
	const d = /* @__PURE__ */ new Date("2026-05-21T00:00:00Z");
	d.setUTCDate(d.getUTCDate() + n);
	d.setUTCHours(hour, minute, 0, 0);
	return d.toISOString().slice(0, 16);
};
var at = (offsetMinutes) => {
	const d = /* @__PURE__ */ new Date("2026-05-15T09:00:00Z");
	d.setUTCMinutes(d.getUTCMinutes() + offsetMinutes);
	return d.toISOString();
};
var initialTasks = [
	{
		id: "task_1",
		title: "修复登录页 SSO 跳转死循环",
		description: "部分企业租户从 IDP 跳回后陷入 302 死循环，影响周一上班高峰登录",
		projectId: "p_platform",
		tagIds: ["t_bug", "t_urgent"],
		priority: "urgent",
		status: "in_progress",
		dueDate: daysFromNow(1, 10, 30),
		assignee: "刺秦",
		createdAt: at(0)
	},
	{
		id: "task_2",
		title: "完成新版定价页 A/B 实验",
		description: "把月付/年付切换默认值改为年付，跑两周看转化",
		projectId: "p_growth",
		tagIds: ["t_feature", "t_research"],
		priority: "high",
		status: "in_progress",
		dueDate: daysFromNow(7, 17, 0),
		assignee: "文典",
		createdAt: at(120)
	},
	{
		id: "task_3",
		title: "官网首页 hero 视觉重做",
		description: "配合品牌升级，将 hero 区从插画切换为产品截图 + 极简标题",
		projectId: "p_brand",
		tagIds: ["t_design", "t_feature"],
		priority: "medium",
		status: "todo",
		dueDate: daysFromNow(14, 14, 0),
		assignee: "苏婉",
		createdAt: at(360)
	},
	{
		id: "task_4",
		title: "撰写 WebMCP 入门指南",
		description: "面向新用户写一篇 5 分钟上手指南，含一段 GIF 演示",
		projectId: "p_platform",
		tagIds: ["t_docs"],
		priority: "medium",
		status: "todo",
		dueDate: daysFromNow(10, 11, 0),
		assignee: "周野",
		createdAt: at(480)
	},
	{
		id: "task_5",
		title: "调研竞品的引导流程",
		description: "挑 5 个同类产品截图 onboarding，整理共性与差异",
		projectId: "p_growth",
		tagIds: ["t_research"],
		priority: "low",
		status: "todo",
		dueDate: daysFromNow(21, 16, 30),
		assignee: "叶舟",
		createdAt: at(540)
	},
	{
		id: "task_6",
		title: "修复任务列表分页跳页错位",
		description: "点第 3 页后再点搜索，分页器仍停在 3，结果集已过滤但视觉错位",
		projectId: "p_platform",
		tagIds: ["t_bug"],
		priority: "high",
		status: "todo",
		dueDate: daysFromNow(3, 9, 0),
		assignee: "刺秦",
		createdAt: at(600)
	},
	{
		id: "task_7",
		title: "设计任务卡片 hover 微动效",
		description: "加一个 120ms 的轻微上浮 + 阴影变化，提升可点性",
		projectId: "p_brand",
		tagIds: ["t_design"],
		priority: "low",
		status: "todo",
		dueDate: daysFromNow(9, 19, 0),
		assignee: "苏婉",
		createdAt: at(660)
	},
	{
		id: "task_8",
		title: "梳理 Q3 增长 OKR",
		description: "把 OKR 拆到周维度，确认 owner 与对齐会议节奏",
		projectId: "p_growth",
		tagIds: ["t_research", "t_docs"],
		priority: "high",
		status: "in_progress",
		dueDate: daysFromNow(5, 15, 0),
		assignee: "文典",
		createdAt: at(720)
	},
	{
		id: "task_9",
		title: "CI 缓存命中率优化",
		description: "把 pnpm store / turbo cache 落到云端，目标命中率 > 80%",
		projectId: "p_platform",
		tagIds: ["t_feature"],
		priority: "medium",
		status: "todo",
		dueDate: daysFromNow(12, 12, 0),
		assignee: "周野",
		createdAt: at(780)
	},
	{
		id: "task_10",
		title: "完成上周用户访谈纪要",
		description: "5 个访谈整理为关键洞察清单，分发到产品/设计周会",
		projectId: "p_growth",
		tagIds: ["t_research", "t_docs"],
		priority: "medium",
		status: "done",
		dueDate: daysFromNow(-1, 18, 0),
		assignee: "叶舟",
		createdAt: at(840)
	},
	{
		id: "task_11",
		title: "更新品牌字体到 Fraunces",
		description: "官网 + 文档站标题统一使用 Fraunces 衬线体",
		projectId: "p_brand",
		tagIds: ["t_design"],
		priority: "medium",
		status: "done",
		dueDate: daysFromNow(-3, 17, 0),
		assignee: "苏婉",
		createdAt: at(900)
	},
	{
		id: "task_12",
		title: "修复 OAuth 回调 state 校验",
		description: "修复回调路径漏校验 state 导致的 CSRF 风险",
		projectId: "p_platform",
		tagIds: ["t_bug", "t_urgent"],
		priority: "urgent",
		status: "done",
		dueDate: daysFromNow(-2, 8, 30),
		assignee: "刺秦",
		createdAt: at(960)
	},
	{
		id: "task_13",
		title: "清理过期 mock 数据脚本",
		description: "把 staging 上残留的演示数据下线，避免误导",
		projectId: "p_inbox",
		tagIds: ["t_docs"],
		priority: "low",
		status: "archived",
		dueDate: null,
		assignee: "周野",
		createdAt: at(1020)
	},
	{
		id: "task_14",
		title: "探索 webmcp 调试面板雏形",
		description: "让用户在页面侧边栏直观看到当前可用的 MCP 工具",
		projectId: "p_platform",
		tagIds: ["t_feature", "t_research"],
		priority: "high",
		status: "in_progress",
		dueDate: daysFromNow(4, 16, 0),
		assignee: "文典",
		createdAt: at(1080)
	}
];
//#endregion
//#region src/store/types.ts
var EMPTY_FILTERS = {
	search: "",
	projectId: null,
	tagIds: [],
	priorities: [],
	statuses: [],
	assignee: null,
	dueFrom: null,
	dueTo: null
};
var PRIORITY_ORDER = {
	urgent: 0,
	high: 1,
	medium: 2,
	low: 3
};
var PRIORITY_LABEL = {
	urgent: "紧急",
	high: "高",
	medium: "中",
	low: "低"
};
var STATUS_LABEL = {
	todo: "待办",
	in_progress: "进行中",
	done: "已完成",
	archived: "已归档"
};
var DEFAULT_SORT = {
	field: "default",
	direction: "asc"
};
//#endregion
//#region ../../node_modules/.pnpm/react@19.2.6/node_modules/react/cjs/react-jsx-runtime.production.js
/**
* @license React
* react-jsx-runtime.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_jsx_runtime_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
	function jsxProd(type, config, maybeKey) {
		var key = null;
		void 0 !== maybeKey && (key = "" + maybeKey);
		void 0 !== config.key && (key = "" + config.key);
		if ("key" in config) {
			maybeKey = {};
			for (var propName in config) "key" !== propName && (maybeKey[propName] = config[propName]);
		} else maybeKey = config;
		config = maybeKey.ref;
		return {
			$$typeof: REACT_ELEMENT_TYPE,
			type,
			key,
			ref: void 0 !== config ? config : null,
			props: maybeKey
		};
	}
	exports.Fragment = REACT_FRAGMENT_TYPE;
	exports.jsx = jsxProd;
	exports.jsxs = jsxProd;
}));
//#endregion
//#region src/store/TodoStore.tsx
var import_jsx_runtime = (/* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_react_jsx_runtime_production();
})))();
var TodoStoreContext = (0, import_react.createContext)(null);
function TodoStoreProvider({ children, seed }) {
	const [tasks, setTasks] = (0, import_react.useState)(seed?.tasks ?? initialTasks);
	const [projects, setProjects] = (0, import_react.useState)(seed?.projects ?? initialProjects);
	const [tags, setTags] = (0, import_react.useState)(seed?.tags ?? initialTags);
	const idCounter = (0, import_react.useRef)(1);
	const nextId = (prefix) => {
		const n = idCounter.current++;
		return `${prefix}_${Date.now().toString(36)}_${n}`;
	};
	/**
	* [作用域：页面级 / 由 useWebMcpTools 在挂载页面期间注册] 新建任务（写入全局任务列表）。
	*/
	const createTask = (0, import_react.useCallback)((input) => {
		const task = {
			id: nextId("task"),
			title: input.title.trim() || "未命名任务",
			description: input.description ?? "",
			projectId: input.projectId ?? "p_inbox",
			tagIds: input.tagIds ?? [],
			priority: input.priority ?? "medium",
			status: input.status ?? "todo",
			dueDate: input.dueDate ?? null,
			assignee: input.assignee ?? "刺秦",
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		setTasks((prev) => [task, ...prev]);
		return task;
	}, []);
	/**
	* [作用域：页面级 / 由 useWebMcpTools 在挂载页面期间注册] 部分更新一条任务的字段（除 id / createdAt 外都可更新）。
	*/
	const updateTask = (0, import_react.useCallback)((input) => {
		const { id, ...patch } = input;
		let updated = null;
		setTasks((prev) => prev.map((t) => {
			if (t.id !== id) return t;
			updated = {
				...t,
				...patch,
				id: t.id,
				createdAt: t.createdAt
			};
			return updated;
		}));
		return updated;
	}, []);
	/**
	* [作用域：页面级 / 由 useWebMcpTools 在挂载页面期间注册] 删除一条任务。
	*/
	const deleteTask = (0, import_react.useCallback)((input) => {
		let existed = false;
		setTasks((prev) => {
			existed = prev.some((t) => t.id === input.id);
			return prev.filter((t) => t.id !== input.id);
		});
		return existed;
	}, []);
	/**
	* [作用域：页面级 / 由 useWebMcpTools 在挂载页面期间注册] 批量删除任务（一次传多个 ID）。
	*/
	const deleteTasks = (0, import_react.useCallback)((input) => {
		const idSet = new Set(input.ids);
		let count = 0;
		setTasks((prev) => {
			const next = prev.filter((t) => !idSet.has(t.id));
			count = prev.length - next.length;
			return next;
		});
		return { deleted: count };
	}, []);
	/**
	* [作用域：页面级 / 由 useWebMcpTools 在挂载页面期间注册] 切换任务状态（todo / in_progress / done / archived）。
	*/
	const setTaskStatus = (0, import_react.useCallback)((input) => updateTask({
		id: input.id,
		status: input.status
	}), [updateTask]);
	/**
	* [作用域：页面级 / 由 useWebMcpTools 在挂载页面期间注册] 批量切换任务状态。
	*/
	const bulkSetTaskStatus = (0, import_react.useCallback)((input) => {
		const idSet = new Set(input.ids);
		let count = 0;
		setTasks((prev) => {
			let local = 0;
			const next = prev.map((t) => {
				if (!idSet.has(t.id)) return t;
				local++;
				return {
					...t,
					status: input.status
				};
			});
			count = local;
			return next;
		});
		return { updated: count };
	}, []);
	/**
	* [作用域：页面级 / 由 useWebMcpTools 在挂载页面期间注册] 设置任务优先级。
	*/
	const setTaskPriority = (0, import_react.useCallback)((input) => updateTask({
		id: input.id,
		priority: input.priority
	}), [updateTask]);
	/**
	* [作用域：页面级 / 由 useWebMcpTools 在挂载页面期间注册] 设置任务截止时间，传 null 清除。
	*/
	const setTaskDueDate = (0, import_react.useCallback)((input) => updateTask({
		id: input.id,
		dueDate: input.dueDate
	}), [updateTask]);
	/**
	* [作用域：页面级 / 由 useWebMcpTools 在挂载页面期间注册] 设置任务负责人。
	*/
	const setTaskAssignee = (0, import_react.useCallback)((input) => updateTask({
		id: input.id,
		assignee: input.assignee
	}), [updateTask]);
	/**
	* [作用域：页面级 / 由 useWebMcpTools 在挂载页面期间注册] 把任务移动到另一个项目。
	*/
	const moveTaskToProject = (0, import_react.useCallback)((input) => updateTask({
		id: input.id,
		projectId: input.projectId
	}), [updateTask]);
	/**
	* [作用域：页面级 / 由 useWebMcpTools 在挂载页面期间注册] 给任务追加一个标签（已有则忽略）。
	*/
	const addTaskTag = (0, import_react.useCallback)((input) => {
		let updated = null;
		setTasks((prev) => prev.map((t) => {
			if (t.id !== input.taskId) return t;
			if (t.tagIds.includes(input.tagId)) {
				updated = t;
				return t;
			}
			updated = {
				...t,
				tagIds: [...t.tagIds, input.tagId]
			};
			return updated;
		}));
		return updated;
	}, []);
	/**
	* [作用域：页面级 / 由 useWebMcpTools 在挂载页面期间注册] 从任务移除一个标签。
	*/
	const removeTaskTag = (0, import_react.useCallback)((input) => {
		let updated = null;
		setTasks((prev) => prev.map((t) => {
			if (t.id !== input.taskId) return t;
			if (!t.tagIds.includes(input.tagId)) {
				updated = t;
				return t;
			}
			updated = {
				...t,
				tagIds: t.tagIds.filter((x) => x !== input.tagId)
			};
			return updated;
		}));
		return updated;
	}, []);
	/**
	* [作用域：页面级 / 由 useWebMcpTools 在挂载页面期间注册] 新建一个项目。
	*/
	const createProject = (0, import_react.useCallback)((input) => {
		const project = {
			id: nextId("p"),
			name: input.name.trim() || "未命名项目",
			description: input.description ?? "",
			color: input.color ?? "#94a3b8"
		};
		setProjects((prev) => [...prev, project]);
		return project;
	}, []);
	/**
	* [作用域：页面级 / 由 useWebMcpTools 在挂载页面期间注册] 修改项目（名称 / 描述 / 颜色，部分更新）。
	*/
	const updateProject = (0, import_react.useCallback)((input) => {
		const { id, ...patch } = input;
		let updated = null;
		setProjects((prev) => prev.map((p) => {
			if (p.id !== id) return p;
			updated = {
				...p,
				...patch,
				id: p.id
			};
			return updated;
		}));
		return updated;
	}, []);
	/**
	* [作用域：页面级 / 由 useWebMcpTools 在挂载页面期间注册] 删除项目（p_inbox 不可删；原任务会被移回收件箱）。
	*/
	const deleteProject = (0, import_react.useCallback)((input) => {
		if (input.id === "p_inbox") return false;
		let existed = false;
		setProjects((prev) => {
			existed = prev.some((p) => p.id === input.id);
			return prev.filter((p) => p.id !== input.id);
		});
		setTasks((prev) => prev.map((t) => t.projectId === input.id ? {
			...t,
			projectId: "p_inbox"
		} : t));
		return existed;
	}, []);
	/**
	* [作用域：页面级 / 由 useWebMcpTools 在挂载页面期间注册] 新建一个标签。
	*/
	const createTag = (0, import_react.useCallback)((input) => {
		const tag = {
			id: nextId("t"),
			name: input.name.trim() || "tag",
			color: input.color ?? "#64748b"
		};
		setTags((prev) => [...prev, tag]);
		return tag;
	}, []);
	/**
	* [作用域：页面级 / 由 useWebMcpTools 在挂载页面期间注册] 修改标签（名称 / 颜色，部分更新）。
	*/
	const updateTag = (0, import_react.useCallback)((input) => {
		const { id, ...patch } = input;
		let updated = null;
		setTags((prev) => prev.map((t) => {
			if (t.id !== id) return t;
			updated = {
				...t,
				...patch,
				id: t.id
			};
			return updated;
		}));
		return updated;
	}, []);
	/**
	* [作用域：页面级 / 由 useWebMcpTools 在挂载页面期间注册] 删除一个标签（同时从所有任务上移除该标签引用）。
	*/
	const deleteTag = (0, import_react.useCallback)((input) => {
		let existed = false;
		setTags((prev) => {
			existed = prev.some((t) => t.id === input.id);
			return prev.filter((t) => t.id !== input.id);
		});
		setTasks((prev) => prev.map((t) => t.tagIds.includes(input.id) ? {
			...t,
			tagIds: t.tagIds.filter((x) => x !== input.id)
		} : t));
		return existed;
	}, []);
	/**
	* 按多条件过滤并按优先级 + 截止日期排序后返回任务列表。
	* @readonly
	*/
	const filterTasks = (0, import_react.useCallback)((input) => {
		const q = input.search.trim().toLowerCase();
		return tasks.filter((t) => {
			if (q) {
				if (!(t.title + " " + t.description).toLowerCase().includes(q)) return false;
			}
			if (input.projectId && t.projectId !== input.projectId) return false;
			if (input.tagIds.length > 0) {
				if (!input.tagIds.every((tid) => t.tagIds.includes(tid))) return false;
			}
			if (input.priorities.length > 0 && !input.priorities.includes(t.priority)) return false;
			if (input.statuses.length > 0 && !input.statuses.includes(t.status)) return false;
			if (input.assignee && t.assignee !== input.assignee) return false;
			if (input.dueFrom) {
				const day = t.dueDate?.slice(0, 10);
				if (!day || day < input.dueFrom) return false;
			}
			if (input.dueTo) {
				const day = t.dueDate?.slice(0, 10);
				if (!day || day > input.dueTo) return false;
			}
			return true;
		}).sort((a, b) => {
			const ap = PRIORITY_ORDER[a.priority];
			const bp = PRIORITY_ORDER[b.priority];
			if (ap !== bp) return ap - bp;
			const ad = a.dueDate ?? "9999-99-99";
			const bd = b.dueDate ?? "9999-99-99";
			return ad.localeCompare(bd);
		});
	}, [tasks]);
	/**
	* 根据 ID 获取单条任务。
	* @readonly
	*/
	const getTaskById = (0, import_react.useCallback)((input) => tasks.find((t) => t.id === input.id) ?? null, [tasks]);
	/**
	* 根据 ID 获取单个项目。
	* @readonly
	*/
	const getProjectById = (0, import_react.useCallback)((input) => projects.find((p) => p.id === input.id) ?? null, [projects]);
	/**
	* 根据 ID 获取单个标签。
	* @readonly
	*/
	const getTagById = (0, import_react.useCallback)((input) => tags.find((t) => t.id === input.id) ?? null, [tags]);
	const value = (0, import_react.useMemo)(() => ({
		tasks,
		projects,
		tags,
		createTask,
		updateTask,
		deleteTask,
		deleteTasks,
		setTaskStatus,
		bulkSetTaskStatus,
		setTaskPriority,
		setTaskDueDate,
		setTaskAssignee,
		moveTaskToProject,
		addTaskTag,
		removeTaskTag,
		createProject,
		updateProject,
		deleteProject,
		createTag,
		updateTag,
		deleteTag,
		filterTasks,
		getTaskById,
		getProjectById,
		getTagById
	}), [
		tasks,
		projects,
		tags,
		createTask,
		updateTask,
		deleteTask,
		deleteTasks,
		setTaskStatus,
		bulkSetTaskStatus,
		setTaskPriority,
		setTaskDueDate,
		setTaskAssignee,
		moveTaskToProject,
		addTaskTag,
		removeTaskTag,
		createProject,
		updateProject,
		deleteProject,
		createTag,
		updateTag,
		deleteTag,
		filterTasks,
		getTaskById,
		getProjectById,
		getTagById
	]);
	(0, import_react.useEffect)(() => {
		__publishStoreRef(value);
		return () => {
			__publishStoreRef(null);
		};
	}, [value]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TodoStoreContext.Provider, {
		value,
		children
	});
}
function useTodoStore() {
	const value = (0, import_react.useContext)(TodoStoreContext);
	if (!value) throw new Error("useTodoStore must be used within <TodoStoreProvider>");
	return value;
}
var storeRef = null;
/** Internal: published by the provider so global tools can access the live store from outside React. */
function __publishStoreRef(value) {
	storeRef = value;
}
/** Used by global tools (registered via registerGlobalTools) — they live outside the React tree. */
function getStoreRef() {
	if (!storeRef) throw new Error("TodoStore is not yet initialized");
	return storeRef;
}
//#endregion
//#region src/tools/queries.ts
var queries_exports = /* @__PURE__ */ __exportAll({
	getProject: () => getProject,
	getStats: () => getStats,
	getTag: () => getTag,
	getTask: () => getTask,
	listAssignees: () => listAssignees,
	listProjects: () => listProjects,
	listTags: () => listTags,
	listTasks: () => listTasks,
	searchTasks: () => searchTasks
});
function toDTO(t) {
	return {
		id: t.id,
		title: t.title,
		description: t.description,
		projectId: t.projectId,
		tagIds: [...t.tagIds],
		priority: t.priority,
		status: t.status,
		dueDate: t.dueDate,
		assignee: t.assignee,
		createdAt: t.createdAt
	};
}
/**
* [作用域：全局] 列出全部任务（不过滤，可指定数量上限）。
* @readonly
*/
async function listTasks(params) {
	const all = getStoreRef().tasks.map(toDTO);
	const limit = params.limit ?? 200;
	return {
		count: all.length,
		tasks: all.slice(0, limit)
	};
}
/**
* [作用域：全局] 根据 ID 读取单条任务详情。
* @readonly
*/
async function getTask(params) {
	const t = getStoreRef().getTaskById({ id: params.id });
	return { task: t ? toDTO(t) : null };
}
/**
* [作用域：全局] 跨页面搜索任务（关键词匹配标题与描述，可叠加项目/标签/优先级/状态/负责人/截止日期范围等过滤）。
* @readonly
*/
async function searchTasks(params) {
	const tasks = getStoreRef().filterTasks({
		search: params.query ?? "",
		projectId: params.projectId ?? null,
		tagIds: params.tagIds ?? [],
		priorities: params.priorities ?? [],
		statuses: params.statuses ?? [],
		assignee: params.assignee ?? null,
		dueFrom: params.dueFrom ?? null,
		dueTo: params.dueTo ?? null
	});
	const limit = params.limit ?? 50;
	return {
		count: tasks.length,
		results: tasks.slice(0, limit).map((t) => ({
			id: t.id,
			title: t.title,
			status: t.status,
			priority: t.priority,
			projectId: t.projectId,
			assignee: t.assignee,
			dueDate: t.dueDate
		}))
	};
}
/**
* [作用域：全局] 列出所有项目（含每个项目的任务数）。
* @readonly
*/
async function listProjects(_params) {
	const store = getStoreRef();
	return { projects: store.projects.map((p) => ({
		...p,
		taskCount: store.tasks.filter((t) => t.projectId === p.id).length
	})) };
}
/**
* [作用域：全局] 读取单个项目详情（含任务数）。
* @readonly
*/
async function getProject(params) {
	const store = getStoreRef();
	const p = store.getProjectById({ id: params.id });
	if (!p) return {
		project: null,
		taskCount: 0
	};
	const taskCount = store.tasks.filter((t) => t.projectId === p.id).length;
	return {
		project: { ...p },
		taskCount
	};
}
/**
* [作用域：全局] 列出所有标签（含每个标签关联的任务数）。
* @readonly
*/
async function listTags(_params) {
	const store = getStoreRef();
	return { tags: store.tags.map((t) => ({
		...t,
		taskCount: store.tasks.filter((x) => x.tagIds.includes(t.id)).length
	})) };
}
/**
* [作用域：全局] 读取单个标签详情（含任务数）。
* @readonly
*/
async function getTag(params) {
	const store = getStoreRef();
	const t = store.getTagById({ id: params.id });
	if (!t) return {
		tag: null,
		taskCount: 0
	};
	const taskCount = store.tasks.filter((x) => x.tagIds.includes(t.id)).length;
	return {
		tag: { ...t },
		taskCount
	};
}
/**
* [作用域：全局] 列出所有出现过的负责人（用于过滤、分配）。
* @readonly
*/
async function listAssignees(_params) {
	const tasks = getStoreRef().tasks;
	const map = /* @__PURE__ */ new Map();
	for (const t of tasks) map.set(t.assignee, (map.get(t.assignee) ?? 0) + 1);
	return { assignees: Array.from(map.entries()).map(([name, taskCount]) => ({
		name,
		taskCount
	})) };
}
/**
* [作用域：全局] 读取当前应用的整体统计（任务总数 / 各状态数 / 逾期数）。
* @readonly
*/
async function getStats(_params) {
	const tasks = getStoreRef().tasks;
	const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	return {
		total: tasks.length,
		todo: tasks.filter((t) => t.status === "todo").length,
		in_progress: tasks.filter((t) => t.status === "in_progress").length,
		done: tasks.filter((t) => t.status === "done").length,
		archived: tasks.filter((t) => t.status === "archived").length,
		overdue: tasks.filter((t) => t.dueDate && t.dueDate < today && t.status !== "done" && t.status !== "archived").length
	};
}
//#endregion
//#region src/tools/navigation-bridge.ts
var navigateRef = null;
function publishNavigate(n) {
	navigateRef = n;
}
//#endregion
//#region src/tools/navigation.ts
var navigation_exports = /* @__PURE__ */ __exportAll({ navigate: () => navigate });
/**
* [作用域：全局] 在应用内跳转路由（如 /tasks /projects /projects/:id /tags）。
*/
async function navigate(params) {
	if (!navigateRef) return { navigated: false };
	navigateRef(params.to);
	return { navigated: true };
}
//#endregion
//#region \0vite/preload-helper.js
var scriptRel = "modulepreload";
var assetsURL = function(dep) {
	return "/webmcp-nexus/" + dep;
};
var seen = {};
var __vitePreload = function preload(baseModule, deps, importerUrl) {
	let promise = Promise.resolve();
	if (deps && deps.length > 0) {
		const links = document.getElementsByTagName("link");
		const cspNonceMeta = document.querySelector("meta[property=csp-nonce]");
		const cspNonce = cspNonceMeta?.nonce || cspNonceMeta?.getAttribute("nonce");
		function allSettled(promises) {
			return Promise.all(promises.map((p) => Promise.resolve(p).then((value) => ({
				status: "fulfilled",
				value
			}), (reason) => ({
				status: "rejected",
				reason
			}))));
		}
		promise = allSettled(deps.map((dep) => {
			dep = assetsURL(dep, importerUrl);
			if (dep in seen) return;
			seen[dep] = true;
			const isCss = dep.endsWith(".css");
			const cssSelector = isCss ? "[rel=\"stylesheet\"]" : "";
			if (!!importerUrl) for (let i = links.length - 1; i >= 0; i--) {
				const link = links[i];
				if (link.href === dep && (!isCss || link.rel === "stylesheet")) return;
			}
			else if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) return;
			const link = document.createElement("link");
			link.rel = isCss ? "stylesheet" : scriptRel;
			if (!isCss) link.as = "script";
			link.crossOrigin = "";
			link.href = dep;
			if (cspNonce) link.setAttribute("nonce", cspNonce);
			document.head.appendChild(link);
			if (isCss) return new Promise((res, rej) => {
				link.addEventListener("load", res);
				link.addEventListener("error", () => rej(/* @__PURE__ */ new Error(`Unable to preload CSS for ${dep}`)));
			});
		}));
	}
	function handlePreloadError(err) {
		const e = new Event("vite:preloadError", { cancelable: true });
		e.payload = err;
		window.dispatchEvent(e);
		if (!e.defaultPrevented) throw err;
	}
	return promise.then((res) => {
		for (const item of res || []) {
			if (item.status !== "rejected") continue;
			handlePreloadError(item.reason);
		}
		return baseModule().catch(handlePreloadError);
	});
};
//#endregion
//#region ../../node_modules/.pnpm/react-router@7.15.1_react-dom@19.2.6_react@19.2.6__react@19.2.6/node_modules/react-router/dist/development/chunk-4N6VE7H7.mjs
/**
* react-router v7.15.1
*
* Copyright (c) Remix Software Inc.
*
* This source code is licensed under the MIT license found in the
* LICENSE.md file in the root directory of this source tree.
*
* @license MIT
*/
var PopStateEventType = "popstate";
function isLocation(obj) {
	return typeof obj === "object" && obj != null && "pathname" in obj && "search" in obj && "hash" in obj && "state" in obj && "key" in obj;
}
function createBrowserHistory(options = {}) {
	function createBrowserLocation(window2, globalHistory) {
		let maskedLocation = globalHistory.state?.masked;
		let { pathname, search, hash } = maskedLocation || window2.location;
		return createLocation("", {
			pathname,
			search,
			hash
		}, globalHistory.state && globalHistory.state.usr || null, globalHistory.state && globalHistory.state.key || "default", maskedLocation ? {
			pathname: window2.location.pathname,
			search: window2.location.search,
			hash: window2.location.hash
		} : void 0);
	}
	function createBrowserHref(window2, to) {
		return typeof to === "string" ? to : createPath(to);
	}
	return getUrlBasedHistory(createBrowserLocation, createBrowserHref, null, options);
}
function invariant(value, message) {
	if (value === false || value === null || typeof value === "undefined") throw new Error(message);
}
function warning(cond, message) {
	if (!cond) {
		if (typeof console !== "undefined") console.warn(message);
		try {
			throw new Error(message);
		} catch (e) {}
	}
}
function createKey() {
	return Math.random().toString(36).substring(2, 10);
}
function getHistoryState(location, index) {
	return {
		usr: location.state,
		key: location.key,
		idx: index,
		masked: location.mask ? {
			pathname: location.pathname,
			search: location.search,
			hash: location.hash
		} : void 0
	};
}
function createLocation(current, to, state = null, key, mask) {
	return {
		pathname: typeof current === "string" ? current : current.pathname,
		search: "",
		hash: "",
		...typeof to === "string" ? parsePath(to) : to,
		state,
		key: to && to.key || key || createKey(),
		mask
	};
}
function createPath({ pathname = "/", search = "", hash = "" }) {
	if (search && search !== "?") pathname += search.charAt(0) === "?" ? search : "?" + search;
	if (hash && hash !== "#") pathname += hash.charAt(0) === "#" ? hash : "#" + hash;
	return pathname;
}
function parsePath(path) {
	let parsedPath = {};
	if (path) {
		let hashIndex = path.indexOf("#");
		if (hashIndex >= 0) {
			parsedPath.hash = path.substring(hashIndex);
			path = path.substring(0, hashIndex);
		}
		let searchIndex = path.indexOf("?");
		if (searchIndex >= 0) {
			parsedPath.search = path.substring(searchIndex);
			path = path.substring(0, searchIndex);
		}
		if (path) parsedPath.pathname = path;
	}
	return parsedPath;
}
function getUrlBasedHistory(getLocation, createHref2, validateLocation, options = {}) {
	let { window: window2 = document.defaultView, v5Compat = false } = options;
	let globalHistory = window2.history;
	let action = "POP";
	let listener = null;
	let index = getIndex();
	if (index == null) {
		index = 0;
		globalHistory.replaceState({
			...globalHistory.state,
			idx: index
		}, "");
	}
	function getIndex() {
		return (globalHistory.state || { idx: null }).idx;
	}
	function handlePop() {
		action = "POP";
		let nextIndex = getIndex();
		let delta = nextIndex == null ? null : nextIndex - index;
		index = nextIndex;
		if (listener) listener({
			action,
			location: history.location,
			delta
		});
	}
	function push(to, state) {
		action = "PUSH";
		let location = isLocation(to) ? to : createLocation(history.location, to, state);
		if (validateLocation) validateLocation(location, to);
		index = getIndex() + 1;
		let historyState = getHistoryState(location, index);
		let url = history.createHref(location.mask || location);
		try {
			globalHistory.pushState(historyState, "", url);
		} catch (error) {
			if (error instanceof DOMException && error.name === "DataCloneError") throw error;
			window2.location.assign(url);
		}
		if (v5Compat && listener) listener({
			action,
			location: history.location,
			delta: 1
		});
	}
	function replace2(to, state) {
		action = "REPLACE";
		let location = isLocation(to) ? to : createLocation(history.location, to, state);
		if (validateLocation) validateLocation(location, to);
		index = getIndex();
		let historyState = getHistoryState(location, index);
		let url = history.createHref(location.mask || location);
		globalHistory.replaceState(historyState, "", url);
		if (v5Compat && listener) listener({
			action,
			location: history.location,
			delta: 0
		});
	}
	function createURL(to) {
		return createBrowserURLImpl(to);
	}
	let history = {
		get action() {
			return action;
		},
		get location() {
			return getLocation(window2, globalHistory);
		},
		listen(fn) {
			if (listener) throw new Error("A history only accepts one active listener");
			window2.addEventListener(PopStateEventType, handlePop);
			listener = fn;
			return () => {
				window2.removeEventListener(PopStateEventType, handlePop);
				listener = null;
			};
		},
		createHref(to) {
			return createHref2(window2, to);
		},
		createURL,
		encodeLocation(to) {
			let url = createURL(to);
			return {
				pathname: url.pathname,
				search: url.search,
				hash: url.hash
			};
		},
		push,
		replace: replace2,
		go(n) {
			return globalHistory.go(n);
		}
	};
	return history;
}
function createBrowserURLImpl(to, isAbsolute = false) {
	let base = "http://localhost";
	if (typeof window !== "undefined") base = window.location.origin !== "null" ? window.location.origin : window.location.href;
	invariant(base, "No window.location.(origin|href) available to create URL");
	let href = typeof to === "string" ? to : createPath(to);
	href = href.replace(/ $/, "%20");
	if (!isAbsolute && href.startsWith("//")) href = base + href;
	return new URL(href, base);
}
function matchRoutes(routes, locationArg, basename = "/") {
	return matchRoutesImpl(routes, locationArg, basename, false);
}
function matchRoutesImpl(routes, locationArg, basename, allowPartial, precomputedBranches) {
	let pathname = stripBasename((typeof locationArg === "string" ? parsePath(locationArg) : locationArg).pathname || "/", basename);
	if (pathname == null) return null;
	let branches = precomputedBranches ?? flattenAndRankRoutes(routes);
	let matches = null;
	let decoded = decodePath(pathname);
	for (let i = 0; matches == null && i < branches.length; ++i) matches = matchRouteBranch(branches[i], decoded, allowPartial);
	return matches;
}
function convertRouteMatchToUiMatch(match, loaderData) {
	let { route, pathname, params } = match;
	return {
		id: route.id,
		pathname,
		params,
		data: loaderData[route.id],
		loaderData: loaderData[route.id],
		handle: route.handle
	};
}
function flattenAndRankRoutes(routes) {
	let branches = flattenRoutes(routes);
	rankRouteBranches(branches);
	return branches;
}
function flattenRoutes(routes, branches = [], parentsMeta = [], parentPath = "", _hasParentOptionalSegments = false) {
	let flattenRoute = (route, index, hasParentOptionalSegments = _hasParentOptionalSegments, relativePath) => {
		let meta = {
			relativePath: relativePath === void 0 ? route.path || "" : relativePath,
			caseSensitive: route.caseSensitive === true,
			childrenIndex: index,
			route
		};
		if (meta.relativePath.startsWith("/")) {
			if (!meta.relativePath.startsWith(parentPath) && hasParentOptionalSegments) return;
			invariant(meta.relativePath.startsWith(parentPath), `Absolute route path "${meta.relativePath}" nested under path "${parentPath}" is not valid. An absolute child route path must start with the combined path of all its parent routes.`);
			meta.relativePath = meta.relativePath.slice(parentPath.length);
		}
		let path = joinPaths([parentPath, meta.relativePath]);
		let routesMeta = parentsMeta.concat(meta);
		if (route.children && route.children.length > 0) {
			invariant(route.index !== true, `Index routes must not have child routes. Please remove all child routes from route path "${path}".`);
			flattenRoutes(route.children, branches, routesMeta, path, hasParentOptionalSegments);
		}
		if (route.path == null && !route.index) return;
		branches.push({
			path,
			score: computeScore(path, route.index),
			routesMeta
		});
	};
	routes.forEach((route, index) => {
		if (route.path === "" || !route.path?.includes("?")) flattenRoute(route, index);
		else for (let exploded of explodeOptionalSegments(route.path)) flattenRoute(route, index, true, exploded);
	});
	return branches;
}
function explodeOptionalSegments(path) {
	let segments = path.split("/");
	if (segments.length === 0) return [];
	let [first, ...rest] = segments;
	let isOptional = first.endsWith("?");
	let required = first.replace(/\?$/, "");
	if (rest.length === 0) return isOptional ? [required, ""] : [required];
	let restExploded = explodeOptionalSegments(rest.join("/"));
	let result = [];
	result.push(...restExploded.map((subpath) => subpath === "" ? required : [required, subpath].join("/")));
	if (isOptional) result.push(...restExploded);
	return result.map((exploded) => path.startsWith("/") && exploded === "" ? "/" : exploded);
}
function rankRouteBranches(branches) {
	branches.sort((a, b) => a.score !== b.score ? b.score - a.score : compareIndexes(a.routesMeta.map((meta) => meta.childrenIndex), b.routesMeta.map((meta) => meta.childrenIndex)));
}
var paramRe = /^:[\w-]+$/;
var dynamicSegmentValue = 3;
var indexRouteValue = 2;
var emptySegmentValue = 1;
var staticSegmentValue = 10;
var splatPenalty = -2;
var isSplat = (s) => s === "*";
function computeScore(path, index) {
	let segments = path.split("/");
	let initialScore = segments.length;
	if (segments.some(isSplat)) initialScore += splatPenalty;
	if (index) initialScore += indexRouteValue;
	return segments.filter((s) => !isSplat(s)).reduce((score, segment) => score + (paramRe.test(segment) ? dynamicSegmentValue : segment === "" ? emptySegmentValue : staticSegmentValue), initialScore);
}
function compareIndexes(a, b) {
	return a.length === b.length && a.slice(0, -1).every((n, i) => n === b[i]) ? a[a.length - 1] - b[b.length - 1] : 0;
}
function matchRouteBranch(branch, pathname, allowPartial = false) {
	let { routesMeta } = branch;
	let matchedParams = {};
	let matchedPathname = "/";
	let matches = [];
	for (let i = 0; i < routesMeta.length; ++i) {
		let meta = routesMeta[i];
		let end = i === routesMeta.length - 1;
		let remainingPathname = matchedPathname === "/" ? pathname : pathname.slice(matchedPathname.length) || "/";
		let match = matchPath({
			path: meta.relativePath,
			caseSensitive: meta.caseSensitive,
			end
		}, remainingPathname);
		let route = meta.route;
		if (!match && end && allowPartial && !routesMeta[routesMeta.length - 1].route.index) match = matchPath({
			path: meta.relativePath,
			caseSensitive: meta.caseSensitive,
			end: false
		}, remainingPathname);
		if (!match) return null;
		Object.assign(matchedParams, match.params);
		matches.push({
			params: matchedParams,
			pathname: joinPaths([matchedPathname, match.pathname]),
			pathnameBase: normalizePathname(joinPaths([matchedPathname, match.pathnameBase])),
			route
		});
		if (match.pathnameBase !== "/") matchedPathname = joinPaths([matchedPathname, match.pathnameBase]);
	}
	return matches;
}
function matchPath(pattern, pathname) {
	if (typeof pattern === "string") pattern = {
		path: pattern,
		caseSensitive: false,
		end: true
	};
	let [matcher, compiledParams] = compilePath(pattern.path, pattern.caseSensitive, pattern.end);
	let match = pathname.match(matcher);
	if (!match) return null;
	let matchedPathname = match[0];
	let pathnameBase = matchedPathname.replace(/(.)\/+$/, "$1");
	let captureGroups = match.slice(1);
	return {
		params: compiledParams.reduce((memo2, { paramName, isOptional }, index) => {
			if (paramName === "*") {
				let splatValue = captureGroups[index] || "";
				pathnameBase = matchedPathname.slice(0, matchedPathname.length - splatValue.length).replace(/(.)\/+$/, "$1");
			}
			const value = captureGroups[index];
			if (isOptional && !value) memo2[paramName] = void 0;
			else memo2[paramName] = (value || "").replace(/%2F/g, "/");
			return memo2;
		}, {}),
		pathname: matchedPathname,
		pathnameBase,
		pattern
	};
}
function compilePath(path, caseSensitive = false, end = true) {
	warning(path === "*" || !path.endsWith("*") || path.endsWith("/*"), `Route path "${path}" will be treated as if it were "${path.replace(/\*$/, "/*")}" because the \`*\` character must always follow a \`/\` in the pattern. To get rid of this warning, please change the route path to "${path.replace(/\*$/, "/*")}".`);
	let params = [];
	let regexpSource = "^" + path.replace(/\/*\*?$/, "").replace(/^\/*/, "/").replace(/[\\.*+^${}|()[\]]/g, "\\$&").replace(/\/:([\w-]+)(\?)?/g, (match, paramName, isOptional, index, str) => {
		params.push({
			paramName,
			isOptional: isOptional != null
		});
		if (isOptional) {
			let nextChar = str.charAt(index + match.length);
			if (nextChar && nextChar !== "/") return "/([^\\/]*)";
			return "(?:/([^\\/]*))?";
		}
		return "/([^\\/]+)";
	}).replace(/\/([\w-]+)\?(\/|$)/g, "(/$1)?$2");
	if (path.endsWith("*")) {
		params.push({ paramName: "*" });
		regexpSource += path === "*" || path === "/*" ? "(.*)$" : "(?:\\/(.+)|\\/*)$";
	} else if (end) regexpSource += "\\/*$";
	else if (path !== "" && path !== "/") regexpSource += "(?:(?=\\/|$))";
	return [new RegExp(regexpSource, caseSensitive ? void 0 : "i"), params];
}
function decodePath(value) {
	try {
		return value.split("/").map((v) => decodeURIComponent(v).replace(/\//g, "%2F")).join("/");
	} catch (error) {
		warning(false, `The URL path "${value}" could not be decoded because it is a malformed URL segment. This is probably due to a bad percent encoding (${error}).`);
		return value;
	}
}
function stripBasename(pathname, basename) {
	if (basename === "/") return pathname;
	if (!pathname.toLowerCase().startsWith(basename.toLowerCase())) return null;
	let startIndex = basename.endsWith("/") ? basename.length - 1 : basename.length;
	let nextChar = pathname.charAt(startIndex);
	if (nextChar && nextChar !== "/") return null;
	return pathname.slice(startIndex) || "/";
}
var ABSOLUTE_URL_REGEX = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;
function resolvePath(to, fromPathname = "/") {
	let { pathname: toPathname, search = "", hash = "" } = typeof to === "string" ? parsePath(to) : to;
	let pathname;
	if (toPathname) {
		toPathname = removeDoubleSlashes(toPathname);
		if (toPathname.startsWith("/")) pathname = resolvePathname(toPathname.substring(1), "/");
		else pathname = resolvePathname(toPathname, fromPathname);
	} else pathname = fromPathname;
	return {
		pathname,
		search: normalizeSearch(search),
		hash: normalizeHash(hash)
	};
}
function resolvePathname(relativePath, fromPathname) {
	let segments = removeTrailingSlash(fromPathname).split("/");
	relativePath.split("/").forEach((segment) => {
		if (segment === "..") {
			if (segments.length > 1) segments.pop();
		} else if (segment !== ".") segments.push(segment);
	});
	return segments.length > 1 ? segments.join("/") : "/";
}
function getInvalidPathError(char, field, dest, path) {
	return `Cannot include a '${char}' character in a manually specified \`to.${field}\` field [${JSON.stringify(path)}].  Please separate it out to the \`to.${dest}\` field. Alternatively you may provide the full path as a string in <Link to="..."> and the router will parse it for you.`;
}
function getPathContributingMatches(matches) {
	return matches.filter((match, index) => index === 0 || match.route.path && match.route.path.length > 0);
}
function getResolveToMatches(matches) {
	let pathMatches = getPathContributingMatches(matches);
	return pathMatches.map((match, idx) => idx === pathMatches.length - 1 ? match.pathname : match.pathnameBase);
}
function resolveTo(toArg, routePathnames, locationPathname, isPathRelative = false) {
	let to;
	if (typeof toArg === "string") to = parsePath(toArg);
	else {
		to = { ...toArg };
		invariant(!to.pathname || !to.pathname.includes("?"), getInvalidPathError("?", "pathname", "search", to));
		invariant(!to.pathname || !to.pathname.includes("#"), getInvalidPathError("#", "pathname", "hash", to));
		invariant(!to.search || !to.search.includes("#"), getInvalidPathError("#", "search", "hash", to));
	}
	let isEmptyPath = toArg === "" || to.pathname === "";
	let toPathname = isEmptyPath ? "/" : to.pathname;
	let from;
	if (toPathname == null) from = locationPathname;
	else {
		let routePathnameIndex = routePathnames.length - 1;
		if (!isPathRelative && toPathname.startsWith("..")) {
			let toSegments = toPathname.split("/");
			while (toSegments[0] === "..") {
				toSegments.shift();
				routePathnameIndex -= 1;
			}
			to.pathname = toSegments.join("/");
		}
		from = routePathnameIndex >= 0 ? routePathnames[routePathnameIndex] : "/";
	}
	let path = resolvePath(to, from);
	let hasExplicitTrailingSlash = toPathname && toPathname !== "/" && toPathname.endsWith("/");
	let hasCurrentTrailingSlash = (isEmptyPath || toPathname === ".") && locationPathname.endsWith("/");
	if (!path.pathname.endsWith("/") && (hasExplicitTrailingSlash || hasCurrentTrailingSlash)) path.pathname += "/";
	return path;
}
var removeDoubleSlashes = (path) => path.replace(/\/\/+/g, "/");
var joinPaths = (paths) => removeDoubleSlashes(paths.join("/"));
var removeTrailingSlash = (path) => path.replace(/\/+$/, "");
var normalizePathname = (pathname) => removeTrailingSlash(pathname).replace(/^\/*/, "/");
var normalizeSearch = (search) => !search || search === "?" ? "" : search.startsWith("?") ? search : "?" + search;
var normalizeHash = (hash) => !hash || hash === "#" ? "" : hash.startsWith("#") ? hash : "#" + hash;
var ErrorResponseImpl = class {
	constructor(status, statusText, data2, internal = false) {
		this.status = status;
		this.statusText = statusText || "";
		this.internal = internal;
		if (data2 instanceof Error) {
			this.data = data2.toString();
			this.error = data2;
		} else this.data = data2;
	}
};
function isRouteErrorResponse(error) {
	return error != null && typeof error.status === "number" && typeof error.statusText === "string" && typeof error.internal === "boolean" && "data" in error;
}
function getRoutePattern(matches) {
	return joinPaths(matches.map((m) => m.route.path).filter(Boolean)) || "/";
}
var isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined" && typeof window.document.createElement !== "undefined";
function parseToInfo(_to, basename) {
	let to = _to;
	if (typeof to !== "string" || !ABSOLUTE_URL_REGEX.test(to)) return {
		absoluteURL: void 0,
		isExternal: false,
		to
	};
	let absoluteURL = to;
	let isExternal = false;
	if (isBrowser) try {
		let currentUrl = new URL(window.location.href);
		let targetUrl = to.startsWith("//") ? new URL(currentUrl.protocol + to) : new URL(to);
		let path = stripBasename(targetUrl.pathname, basename);
		if (targetUrl.origin === currentUrl.origin && path != null) to = path + targetUrl.search + targetUrl.hash;
		else isExternal = true;
	} catch (e) {
		warning(false, `<Link to="${to}"> contains an invalid URL which will probably break when clicked - please update to a valid URL path.`);
	}
	return {
		absoluteURL,
		isExternal,
		to
	};
}
Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
var validMutationMethodsArr = [
	"POST",
	"PUT",
	"PATCH",
	"DELETE"
];
new Set(validMutationMethodsArr);
var validRequestMethodsArr = ["GET", ...validMutationMethodsArr];
new Set(validRequestMethodsArr);
var DataRouterContext = import_react.createContext(null);
DataRouterContext.displayName = "DataRouter";
var DataRouterStateContext = import_react.createContext(null);
DataRouterStateContext.displayName = "DataRouterState";
var RSCRouterContext = import_react.createContext(false);
function useIsRSCRouterContext() {
	return import_react.useContext(RSCRouterContext);
}
var ViewTransitionContext = import_react.createContext({ isTransitioning: false });
ViewTransitionContext.displayName = "ViewTransition";
var FetchersContext = import_react.createContext(/* @__PURE__ */ new Map());
FetchersContext.displayName = "Fetchers";
var AwaitContext = import_react.createContext(null);
AwaitContext.displayName = "Await";
var NavigationContext = import_react.createContext(null);
NavigationContext.displayName = "Navigation";
var LocationContext = import_react.createContext(null);
LocationContext.displayName = "Location";
var RouteContext = import_react.createContext({
	outlet: null,
	matches: [],
	isDataRoute: false
});
RouteContext.displayName = "Route";
var RouteErrorContext = import_react.createContext(null);
RouteErrorContext.displayName = "RouteError";
var ERROR_DIGEST_BASE = "REACT_ROUTER_ERROR";
var ERROR_DIGEST_REDIRECT = "REDIRECT";
var ERROR_DIGEST_ROUTE_ERROR_RESPONSE = "ROUTE_ERROR_RESPONSE";
function decodeRedirectErrorDigest(digest) {
	if (digest.startsWith(`${ERROR_DIGEST_BASE}:${ERROR_DIGEST_REDIRECT}:{`)) try {
		let parsed = JSON.parse(digest.slice(28));
		if (typeof parsed === "object" && parsed && typeof parsed.status === "number" && typeof parsed.statusText === "string" && typeof parsed.location === "string" && typeof parsed.reloadDocument === "boolean" && typeof parsed.replace === "boolean") return parsed;
	} catch {}
}
function decodeRouteErrorResponseDigest(digest) {
	if (digest.startsWith(`${ERROR_DIGEST_BASE}:${ERROR_DIGEST_ROUTE_ERROR_RESPONSE}:{`)) try {
		let parsed = JSON.parse(digest.slice(40));
		if (typeof parsed === "object" && parsed && typeof parsed.status === "number" && typeof parsed.statusText === "string") return new ErrorResponseImpl(parsed.status, parsed.statusText, parsed.data);
	} catch {}
}
function useHref(to, { relative } = {}) {
	invariant(useInRouterContext(), `useHref() may be used only in the context of a <Router> component.`);
	let { basename, navigator } = import_react.useContext(NavigationContext);
	let { hash, pathname, search } = useResolvedPath(to, { relative });
	let joinedPathname = pathname;
	if (basename !== "/") joinedPathname = pathname === "/" ? basename : joinPaths([basename, pathname]);
	return navigator.createHref({
		pathname: joinedPathname,
		search,
		hash
	});
}
function useInRouterContext() {
	return import_react.useContext(LocationContext) != null;
}
function useLocation() {
	invariant(useInRouterContext(), `useLocation() may be used only in the context of a <Router> component.`);
	return import_react.useContext(LocationContext).location;
}
var navigateEffectWarning = `You should call navigate() in a React.useEffect(), not when your component is first rendered.`;
function useIsomorphicLayoutEffect(cb) {
	if (!import_react.useContext(NavigationContext).static) import_react.useLayoutEffect(cb);
}
function useNavigate() {
	let { isDataRoute } = import_react.useContext(RouteContext);
	return isDataRoute ? useNavigateStable() : useNavigateUnstable();
}
function useNavigateUnstable() {
	invariant(useInRouterContext(), `useNavigate() may be used only in the context of a <Router> component.`);
	let dataRouterContext = import_react.useContext(DataRouterContext);
	let { basename, navigator } = import_react.useContext(NavigationContext);
	let { matches } = import_react.useContext(RouteContext);
	let { pathname: locationPathname } = useLocation();
	let routePathnamesJson = JSON.stringify(getResolveToMatches(matches));
	let activeRef = import_react.useRef(false);
	useIsomorphicLayoutEffect(() => {
		activeRef.current = true;
	});
	return import_react.useCallback((to, options = {}) => {
		warning(activeRef.current, navigateEffectWarning);
		if (!activeRef.current) return;
		if (typeof to === "number") {
			navigator.go(to);
			return;
		}
		let path = resolveTo(to, JSON.parse(routePathnamesJson), locationPathname, options.relative === "path");
		if (dataRouterContext == null && basename !== "/") path.pathname = path.pathname === "/" ? basename : joinPaths([basename, path.pathname]);
		(!!options.replace ? navigator.replace : navigator.push)(path, options.state, options);
	}, [
		basename,
		navigator,
		routePathnamesJson,
		locationPathname,
		dataRouterContext
	]);
}
import_react.createContext(null);
function useParams() {
	let { matches } = import_react.useContext(RouteContext);
	return matches[matches.length - 1]?.params ?? {};
}
function useResolvedPath(to, { relative } = {}) {
	let { matches } = import_react.useContext(RouteContext);
	let { pathname: locationPathname } = useLocation();
	let routePathnamesJson = JSON.stringify(getResolveToMatches(matches));
	return import_react.useMemo(() => resolveTo(to, JSON.parse(routePathnamesJson), locationPathname, relative === "path"), [
		to,
		routePathnamesJson,
		locationPathname,
		relative
	]);
}
function useRoutes(routes, locationArg) {
	return useRoutesImpl(routes, locationArg);
}
function useRoutesImpl(routes, locationArg, dataRouterOpts) {
	invariant(useInRouterContext(), `useRoutes() may be used only in the context of a <Router> component.`);
	let { navigator } = import_react.useContext(NavigationContext);
	let { matches: parentMatches } = import_react.useContext(RouteContext);
	let routeMatch = parentMatches[parentMatches.length - 1];
	let parentParams = routeMatch ? routeMatch.params : {};
	let parentPathname = routeMatch ? routeMatch.pathname : "/";
	let parentPathnameBase = routeMatch ? routeMatch.pathnameBase : "/";
	let parentRoute = routeMatch && routeMatch.route;
	{
		let parentPath = parentRoute && parentRoute.path || "";
		warningOnce(parentPathname, !parentRoute || parentPath.endsWith("*") || parentPath.endsWith("*?"), `You rendered descendant <Routes> (or called \`useRoutes()\`) at "${parentPathname}" (under <Route path="${parentPath}">) but the parent route path has no trailing "*". This means if you navigate deeper, the parent won't match anymore and therefore the child routes will never render.

Please change the parent <Route path="${parentPath}"> to <Route path="${parentPath === "/" ? "*" : `${parentPath}/*`}">.`);
	}
	let locationFromContext = useLocation();
	let location;
	if (locationArg) {
		let parsedLocationArg = typeof locationArg === "string" ? parsePath(locationArg) : locationArg;
		invariant(parentPathnameBase === "/" || parsedLocationArg.pathname?.startsWith(parentPathnameBase), `When overriding the location using \`<Routes location>\` or \`useRoutes(routes, location)\`, the location pathname must begin with the portion of the URL pathname that was matched by all parent routes. The current pathname base is "${parentPathnameBase}" but pathname "${parsedLocationArg.pathname}" was given in the \`location\` prop.`);
		location = parsedLocationArg;
	} else location = locationFromContext;
	let pathname = location.pathname || "/";
	let remainingPathname = pathname;
	if (parentPathnameBase !== "/") {
		let parentSegments = parentPathnameBase.replace(/^\//, "").split("/");
		remainingPathname = "/" + pathname.replace(/^\//, "").split("/").slice(parentSegments.length).join("/");
	}
	let matches = dataRouterOpts && dataRouterOpts.state.matches.length ? dataRouterOpts.state.matches.map((m) => Object.assign(m, { route: dataRouterOpts.manifest[m.route.id] || m.route })) : matchRoutes(routes, { pathname: remainingPathname });
	warning(parentRoute || matches != null, `No routes matched location "${location.pathname}${location.search}${location.hash}" `);
	warning(matches == null || matches[matches.length - 1].route.element !== void 0 || matches[matches.length - 1].route.Component !== void 0 || matches[matches.length - 1].route.lazy !== void 0, `Matched leaf route at location "${location.pathname}${location.search}${location.hash}" does not have an element or Component. This means it will render an <Outlet /> with a null value by default resulting in an "empty" page.`);
	let renderedMatches = _renderMatches(matches && matches.map((match) => Object.assign({}, match, {
		params: Object.assign({}, parentParams, match.params),
		pathname: joinPaths([parentPathnameBase, navigator.encodeLocation ? navigator.encodeLocation(match.pathname.replace(/%/g, "%25").replace(/\?/g, "%3F").replace(/#/g, "%23")).pathname : match.pathname]),
		pathnameBase: match.pathnameBase === "/" ? parentPathnameBase : joinPaths([parentPathnameBase, navigator.encodeLocation ? navigator.encodeLocation(match.pathnameBase.replace(/%/g, "%25").replace(/\?/g, "%3F").replace(/#/g, "%23")).pathname : match.pathnameBase])
	})), parentMatches, dataRouterOpts);
	if (locationArg && renderedMatches) return /* @__PURE__ */ import_react.createElement(LocationContext.Provider, { value: {
		location: {
			pathname: "/",
			search: "",
			hash: "",
			state: null,
			key: "default",
			mask: void 0,
			...location
		},
		navigationType: "POP"
	} }, renderedMatches);
	return renderedMatches;
}
function DefaultErrorComponent() {
	let error = useRouteError();
	let message = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : error instanceof Error ? error.message : JSON.stringify(error);
	let stack = error instanceof Error ? error.stack : null;
	let lightgrey = "rgba(200,200,200, 0.5)";
	let preStyles = {
		padding: "0.5rem",
		backgroundColor: lightgrey
	};
	let codeStyles = {
		padding: "2px 4px",
		backgroundColor: lightgrey
	};
	let devInfo = null;
	console.error("Error handled by React Router default ErrorBoundary:", error);
	devInfo = /* @__PURE__ */ import_react.createElement(import_react.Fragment, null, /* @__PURE__ */ import_react.createElement("p", null, "💿 Hey developer 👋"), /* @__PURE__ */ import_react.createElement("p", null, "You can provide a way better UX than this when your app throws errors by providing your own ", /* @__PURE__ */ import_react.createElement("code", { style: codeStyles }, "ErrorBoundary"), " or", " ", /* @__PURE__ */ import_react.createElement("code", { style: codeStyles }, "errorElement"), " prop on your route."));
	return /* @__PURE__ */ import_react.createElement(import_react.Fragment, null, /* @__PURE__ */ import_react.createElement("h2", null, "Unexpected Application Error!"), /* @__PURE__ */ import_react.createElement("h3", { style: { fontStyle: "italic" } }, message), stack ? /* @__PURE__ */ import_react.createElement("pre", { style: preStyles }, stack) : null, devInfo);
}
var defaultErrorElement = /* @__PURE__ */ import_react.createElement(DefaultErrorComponent, null);
var RenderErrorBoundary = class extends import_react.Component {
	constructor(props) {
		super(props);
		this.state = {
			location: props.location,
			revalidation: props.revalidation,
			error: props.error
		};
	}
	static getDerivedStateFromError(error) {
		return { error };
	}
	static getDerivedStateFromProps(props, state) {
		if (state.location !== props.location || state.revalidation !== "idle" && props.revalidation === "idle") return {
			error: props.error,
			location: props.location,
			revalidation: props.revalidation
		};
		return {
			error: props.error !== void 0 ? props.error : state.error,
			location: state.location,
			revalidation: props.revalidation || state.revalidation
		};
	}
	componentDidCatch(error, errorInfo) {
		if (this.props.onError) this.props.onError(error, errorInfo);
		else console.error("React Router caught the following error during render", error);
	}
	render() {
		let error = this.state.error;
		if (this.context && typeof error === "object" && error && "digest" in error && typeof error.digest === "string") {
			const decoded = decodeRouteErrorResponseDigest(error.digest);
			if (decoded) error = decoded;
		}
		let result = error !== void 0 ? /* @__PURE__ */ import_react.createElement(RouteContext.Provider, { value: this.props.routeContext }, /* @__PURE__ */ import_react.createElement(RouteErrorContext.Provider, {
			value: error,
			children: this.props.component
		})) : this.props.children;
		if (this.context) return /* @__PURE__ */ import_react.createElement(RSCErrorHandler, { error }, result);
		return result;
	}
};
RenderErrorBoundary.contextType = RSCRouterContext;
var errorRedirectHandledMap = /* @__PURE__ */ new WeakMap();
function RSCErrorHandler({ children, error }) {
	let { basename } = import_react.useContext(NavigationContext);
	if (typeof error === "object" && error && "digest" in error && typeof error.digest === "string") {
		let redirect2 = decodeRedirectErrorDigest(error.digest);
		if (redirect2) {
			let existingRedirect = errorRedirectHandledMap.get(error);
			if (existingRedirect) throw existingRedirect;
			let parsed = parseToInfo(redirect2.location, basename);
			if (isBrowser && !errorRedirectHandledMap.get(error)) if (parsed.isExternal || redirect2.reloadDocument) window.location.href = parsed.absoluteURL || parsed.to;
			else {
				const redirectPromise = Promise.resolve().then(() => window.__reactRouterDataRouter.navigate(parsed.to, { replace: redirect2.replace }));
				errorRedirectHandledMap.set(error, redirectPromise);
				throw redirectPromise;
			}
			return /* @__PURE__ */ import_react.createElement("meta", {
				httpEquiv: "refresh",
				content: `0;url=${parsed.absoluteURL || parsed.to}`
			});
		}
	}
	return children;
}
function RenderedRoute({ routeContext, match, children }) {
	let dataRouterContext = import_react.useContext(DataRouterContext);
	if (dataRouterContext && dataRouterContext.static && dataRouterContext.staticContext && (match.route.errorElement || match.route.ErrorBoundary)) dataRouterContext.staticContext._deepestRenderedBoundaryId = match.route.id;
	return /* @__PURE__ */ import_react.createElement(RouteContext.Provider, { value: routeContext }, children);
}
function _renderMatches(matches, parentMatches = [], dataRouterOpts) {
	let dataRouterState = dataRouterOpts?.state;
	if (matches == null) {
		if (!dataRouterState) return null;
		if (dataRouterState.errors) matches = dataRouterState.matches;
		else if (parentMatches.length === 0 && !dataRouterState.initialized && dataRouterState.matches.length > 0) matches = dataRouterState.matches;
		else return null;
	}
	let renderedMatches = matches;
	let errors = dataRouterState?.errors;
	if (errors != null) {
		let errorIndex = renderedMatches.findIndex((m) => m.route.id && errors?.[m.route.id] !== void 0);
		invariant(errorIndex >= 0, `Could not find a matching route for errors on route IDs: ${Object.keys(errors).join(",")}`);
		renderedMatches = renderedMatches.slice(0, Math.min(renderedMatches.length, errorIndex + 1));
	}
	let renderFallback = false;
	let fallbackIndex = -1;
	if (dataRouterOpts && dataRouterState) {
		renderFallback = dataRouterState.renderFallback;
		for (let i = 0; i < renderedMatches.length; i++) {
			let match = renderedMatches[i];
			if (match.route.HydrateFallback || match.route.hydrateFallbackElement) fallbackIndex = i;
			if (match.route.id) {
				let { loaderData, errors: errors2 } = dataRouterState;
				let needsToRunLoader = match.route.loader && !loaderData.hasOwnProperty(match.route.id) && (!errors2 || errors2[match.route.id] === void 0);
				if (match.route.lazy || needsToRunLoader) {
					if (dataRouterOpts.isStatic) renderFallback = true;
					if (fallbackIndex >= 0) renderedMatches = renderedMatches.slice(0, fallbackIndex + 1);
					else renderedMatches = [renderedMatches[0]];
					break;
				}
			}
		}
	}
	let onErrorHandler = dataRouterOpts?.onError;
	let onError = dataRouterState && onErrorHandler ? (error, errorInfo) => {
		onErrorHandler(error, {
			location: dataRouterState.location,
			params: dataRouterState.matches?.[0]?.params ?? {},
			pattern: getRoutePattern(dataRouterState.matches),
			errorInfo
		});
	} : void 0;
	return renderedMatches.reduceRight((outlet, match, index) => {
		let error;
		let shouldRenderHydrateFallback = false;
		let errorElement = null;
		let hydrateFallbackElement = null;
		if (dataRouterState) {
			error = errors && match.route.id ? errors[match.route.id] : void 0;
			errorElement = match.route.errorElement || defaultErrorElement;
			if (renderFallback) {
				if (fallbackIndex < 0 && index === 0) {
					warningOnce("route-fallback", false, "No `HydrateFallback` element provided to render during initial hydration");
					shouldRenderHydrateFallback = true;
					hydrateFallbackElement = null;
				} else if (fallbackIndex === index) {
					shouldRenderHydrateFallback = true;
					hydrateFallbackElement = match.route.hydrateFallbackElement || null;
				}
			}
		}
		let matches2 = parentMatches.concat(renderedMatches.slice(0, index + 1));
		let getChildren = () => {
			let children;
			if (error) children = errorElement;
			else if (shouldRenderHydrateFallback) children = hydrateFallbackElement;
			else if (match.route.Component) children = /* @__PURE__ */ import_react.createElement(match.route.Component, null);
			else if (match.route.element) children = match.route.element;
			else children = outlet;
			return /* @__PURE__ */ import_react.createElement(RenderedRoute, {
				match,
				routeContext: {
					outlet,
					matches: matches2,
					isDataRoute: dataRouterState != null
				},
				children
			});
		};
		return dataRouterState && (match.route.ErrorBoundary || match.route.errorElement || index === 0) ? /* @__PURE__ */ import_react.createElement(RenderErrorBoundary, {
			location: dataRouterState.location,
			revalidation: dataRouterState.revalidation,
			component: errorElement,
			error,
			children: getChildren(),
			routeContext: {
				outlet: null,
				matches: matches2,
				isDataRoute: true
			},
			onError
		}) : getChildren();
	}, null);
}
function getDataRouterConsoleError(hookName) {
	return `${hookName} must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.`;
}
function useDataRouterContext(hookName) {
	let ctx = import_react.useContext(DataRouterContext);
	invariant(ctx, getDataRouterConsoleError(hookName));
	return ctx;
}
function useDataRouterState(hookName) {
	let state = import_react.useContext(DataRouterStateContext);
	invariant(state, getDataRouterConsoleError(hookName));
	return state;
}
function useRouteContext(hookName) {
	let route = import_react.useContext(RouteContext);
	invariant(route, getDataRouterConsoleError(hookName));
	return route;
}
function useCurrentRouteId(hookName) {
	let route = useRouteContext(hookName);
	let thisRoute = route.matches[route.matches.length - 1];
	invariant(thisRoute.route.id, `${hookName} can only be used on routes that contain a unique "id"`);
	return thisRoute.route.id;
}
function useRouteId() {
	return useCurrentRouteId("useRouteId");
}
function useNavigation() {
	let state = useDataRouterState("useNavigation");
	return import_react.useMemo(() => {
		let { matches, historyAction, ...rest } = state.navigation;
		return rest;
	}, [state.navigation]);
}
function useMatches() {
	let { matches, loaderData } = useDataRouterState("useMatches");
	return import_react.useMemo(() => matches.map((m) => convertRouteMatchToUiMatch(m, loaderData)), [matches, loaderData]);
}
function useRouteError() {
	let error = import_react.useContext(RouteErrorContext);
	let state = useDataRouterState("useRouteError");
	let routeId = useCurrentRouteId("useRouteError");
	if (error !== void 0) return error;
	return state.errors?.[routeId];
}
function useNavigateStable() {
	let { router } = useDataRouterContext("useNavigate");
	let id = useCurrentRouteId("useNavigate");
	let activeRef = import_react.useRef(false);
	useIsomorphicLayoutEffect(() => {
		activeRef.current = true;
	});
	return import_react.useCallback(async (to, options = {}) => {
		warning(activeRef.current, navigateEffectWarning);
		if (!activeRef.current) return;
		if (typeof to === "number") await router.navigate(to);
		else await router.navigate(to, {
			fromRouteId: id,
			...options
		});
	}, [router, id]);
}
var alreadyWarned = {};
function warningOnce(key, cond, message) {
	if (!cond && !alreadyWarned[key]) {
		alreadyWarned[key] = true;
		warning(false, message);
	}
}
import_react.memo(DataRoutes2);
function DataRoutes2({ routes, manifest, future, state, isStatic, onError }) {
	return useRoutesImpl(routes, void 0, {
		manifest,
		state,
		isStatic,
		onError,
		future
	});
}
function Route(props) {
	invariant(false, `A <Route> is only ever to be used as the child of <Routes> element, never rendered directly. Please wrap your <Route> in a <Routes>.`);
}
function Router({ basename: basenameProp = "/", children = null, location: locationProp, navigationType = "POP", navigator, static: staticProp = false, useTransitions }) {
	invariant(!useInRouterContext(), `You cannot render a <Router> inside another <Router>. You should never have more than one in your app.`);
	let basename = basenameProp.replace(/^\/*/, "/");
	let navigationContext = import_react.useMemo(() => ({
		basename,
		navigator,
		static: staticProp,
		useTransitions,
		future: {}
	}), [
		basename,
		navigator,
		staticProp,
		useTransitions
	]);
	if (typeof locationProp === "string") locationProp = parsePath(locationProp);
	let { pathname = "/", search = "", hash = "", state = null, key = "default", mask } = locationProp;
	let locationContext = import_react.useMemo(() => {
		let trailingPathname = stripBasename(pathname, basename);
		if (trailingPathname == null) return null;
		return {
			location: {
				pathname: trailingPathname,
				search,
				hash,
				state,
				key,
				mask
			},
			navigationType
		};
	}, [
		basename,
		pathname,
		search,
		hash,
		state,
		key,
		navigationType,
		mask
	]);
	warning(locationContext != null, `<Router basename="${basename}"> is not able to match the URL "${pathname}${search}${hash}" because it does not start with the basename, so the <Router> won't render anything.`);
	if (locationContext == null) return null;
	return /* @__PURE__ */ import_react.createElement(NavigationContext.Provider, { value: navigationContext }, /* @__PURE__ */ import_react.createElement(LocationContext.Provider, {
		children,
		value: locationContext
	}));
}
function Routes({ children, location }) {
	return useRoutes(createRoutesFromChildren(children), location);
}
import_react.Component;
function createRoutesFromChildren(children, parentPath = []) {
	let routes = [];
	import_react.Children.forEach(children, (element, index) => {
		if (!import_react.isValidElement(element)) return;
		let treePath = [...parentPath, index];
		if (element.type === import_react.Fragment) {
			routes.push.apply(routes, createRoutesFromChildren(element.props.children, treePath));
			return;
		}
		invariant(element.type === Route, `[${typeof element.type === "string" ? element.type : element.type.name}] is not a <Route> component. All component children of <Routes> must be a <Route> or <React.Fragment>`);
		invariant(!element.props.index || !element.props.children, "An index route cannot have child routes.");
		let route = {
			id: element.props.id || treePath.join("-"),
			caseSensitive: element.props.caseSensitive,
			element: element.props.element,
			Component: element.props.Component,
			index: element.props.index,
			path: element.props.path,
			middleware: element.props.middleware,
			loader: element.props.loader,
			action: element.props.action,
			hydrateFallbackElement: element.props.hydrateFallbackElement,
			HydrateFallback: element.props.HydrateFallback,
			errorElement: element.props.errorElement,
			ErrorBoundary: element.props.ErrorBoundary,
			hasErrorBoundary: element.props.hasErrorBoundary === true || element.props.ErrorBoundary != null || element.props.errorElement != null,
			shouldRevalidate: element.props.shouldRevalidate,
			handle: element.props.handle,
			lazy: element.props.lazy
		};
		if (element.props.children) route.children = createRoutesFromChildren(element.props.children, treePath);
		routes.push(route);
	});
	return routes;
}
var defaultMethod = "get";
var defaultEncType = "application/x-www-form-urlencoded";
function isHtmlElement(object) {
	return typeof HTMLElement !== "undefined" && object instanceof HTMLElement;
}
function isButtonElement(object) {
	return isHtmlElement(object) && object.tagName.toLowerCase() === "button";
}
function isFormElement(object) {
	return isHtmlElement(object) && object.tagName.toLowerCase() === "form";
}
function isInputElement(object) {
	return isHtmlElement(object) && object.tagName.toLowerCase() === "input";
}
function isModifiedEvent(event) {
	return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}
function shouldProcessLinkClick(event, target) {
	return event.button === 0 && (!target || target === "_self") && !isModifiedEvent(event);
}
var _formDataSupportsSubmitter = null;
function isFormDataSubmitterSupported() {
	if (_formDataSupportsSubmitter === null) try {
		new FormData(document.createElement("form"), 0);
		_formDataSupportsSubmitter = false;
	} catch (e) {
		_formDataSupportsSubmitter = true;
	}
	return _formDataSupportsSubmitter;
}
var supportedFormEncTypes = /* @__PURE__ */ new Set([
	"application/x-www-form-urlencoded",
	"multipart/form-data",
	"text/plain"
]);
function getFormEncType(encType) {
	if (encType != null && !supportedFormEncTypes.has(encType)) {
		warning(false, `"${encType}" is not a valid \`encType\` for \`<Form>\`/\`<fetcher.Form>\` and will default to "${defaultEncType}"`);
		return null;
	}
	return encType;
}
function getFormSubmissionInfo(target, basename) {
	let method;
	let action;
	let encType;
	let formData;
	let body;
	if (isFormElement(target)) {
		let attr = target.getAttribute("action");
		action = attr ? stripBasename(attr, basename) : null;
		method = target.getAttribute("method") || defaultMethod;
		encType = getFormEncType(target.getAttribute("enctype")) || defaultEncType;
		formData = new FormData(target);
	} else if (isButtonElement(target) || isInputElement(target) && (target.type === "submit" || target.type === "image")) {
		let form = target.form;
		if (form == null) throw new Error(`Cannot submit a <button> or <input type="submit"> without a <form>`);
		let attr = target.getAttribute("formaction") || form.getAttribute("action");
		action = attr ? stripBasename(attr, basename) : null;
		method = target.getAttribute("formmethod") || form.getAttribute("method") || defaultMethod;
		encType = getFormEncType(target.getAttribute("formenctype")) || getFormEncType(form.getAttribute("enctype")) || defaultEncType;
		formData = new FormData(form, target);
		if (!isFormDataSubmitterSupported()) {
			let { name, type, value } = target;
			if (type === "image") {
				let prefix = name ? `${name}.` : "";
				formData.append(`${prefix}x`, "0");
				formData.append(`${prefix}y`, "0");
			} else if (name) formData.append(name, value);
		}
	} else if (isHtmlElement(target)) throw new Error(`Cannot submit element that is not <form>, <button>, or <input type="submit|image">`);
	else {
		method = defaultMethod;
		action = null;
		encType = defaultEncType;
		body = target;
	}
	if (formData && encType === "text/plain") {
		body = formData;
		formData = void 0;
	}
	return {
		action,
		method: method.toLowerCase(),
		encType,
		formData,
		body
	};
}
Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
var ESCAPE_LOOKUP = {
	"&": "\\u0026",
	">": "\\u003e",
	"<": "\\u003c",
	"\u2028": "\\u2028",
	"\u2029": "\\u2029"
};
var ESCAPE_REGEX = /[&><\u2028\u2029]/g;
function escapeHtml(html) {
	return html.replace(ESCAPE_REGEX, (match) => ESCAPE_LOOKUP[match]);
}
function invariant2(value, message) {
	if (value === false || value === null || typeof value === "undefined") throw new Error(message);
}
function singleFetchUrl(reqUrl, basename, trailingSlashAware, extension) {
	let url = typeof reqUrl === "string" ? new URL(reqUrl, typeof window === "undefined" ? "server://singlefetch/" : window.location.origin) : reqUrl;
	if (trailingSlashAware) if (url.pathname.endsWith("/")) url.pathname = `${url.pathname}_.${extension}`;
	else url.pathname = `${url.pathname}.${extension}`;
	else if (url.pathname === "/") url.pathname = `_root.${extension}`;
	else if (basename && stripBasename(url.pathname, basename) === "/") url.pathname = `${removeTrailingSlash(basename)}/_root.${extension}`;
	else url.pathname = `${removeTrailingSlash(url.pathname)}.${extension}`;
	return url;
}
async function loadRouteModule(route, routeModulesCache) {
	if (route.id in routeModulesCache) return routeModulesCache[route.id];
	try {
		let routeModule = await __vitePreload(() => import(
			/* @vite-ignore */
			/* webpackIgnore: true */
			route.module
), []);
		routeModulesCache[route.id] = routeModule;
		return routeModule;
	} catch (error) {
		console.error(`Error loading route module \`${route.module}\`, reloading page...`);
		console.error(error);
		if (window.__reactRouterContext && window.__reactRouterContext.isSpaMode && void 0);
		window.location.reload();
		return new Promise(() => {});
	}
}
function isPageLinkDescriptor(object) {
	return object != null && typeof object.page === "string";
}
function isHtmlLinkDescriptor(object) {
	if (object == null) return false;
	if (object.href == null) return object.rel === "preload" && typeof object.imageSrcSet === "string" && typeof object.imageSizes === "string";
	return typeof object.rel === "string" && typeof object.href === "string";
}
async function getKeyedPrefetchLinks(matches, manifest, routeModules) {
	return dedupeLinkDescriptors((await Promise.all(matches.map(async (match) => {
		let route = manifest.routes[match.route.id];
		if (route) {
			let mod = await loadRouteModule(route, routeModules);
			return mod.links ? mod.links() : [];
		}
		return [];
	}))).flat(1).filter(isHtmlLinkDescriptor).filter((link) => link.rel === "stylesheet" || link.rel === "preload").map((link) => link.rel === "stylesheet" ? {
		...link,
		rel: "prefetch",
		as: "style"
	} : {
		...link,
		rel: "prefetch"
	}));
}
function getNewMatchesForLinks(page, nextMatches, currentMatches, manifest, location, mode) {
	let isNew = (match, index) => {
		if (!currentMatches[index]) return true;
		return match.route.id !== currentMatches[index].route.id;
	};
	let matchPathChanged = (match, index) => {
		return currentMatches[index].pathname !== match.pathname || currentMatches[index].route.path?.endsWith("*") && currentMatches[index].params["*"] !== match.params["*"];
	};
	if (mode === "assets") return nextMatches.filter((match, index) => isNew(match, index) || matchPathChanged(match, index));
	if (mode === "data") return nextMatches.filter((match, index) => {
		let manifestRoute = manifest.routes[match.route.id];
		if (!manifestRoute || !manifestRoute.hasLoader) return false;
		if (isNew(match, index) || matchPathChanged(match, index)) return true;
		if (match.route.shouldRevalidate) {
			let routeChoice = match.route.shouldRevalidate({
				currentUrl: new URL(location.pathname + location.search + location.hash, window.origin),
				currentParams: currentMatches[0]?.params || {},
				nextUrl: new URL(page, window.origin),
				nextParams: match.params,
				defaultShouldRevalidate: true
			});
			if (typeof routeChoice === "boolean") return routeChoice;
		}
		return true;
	});
	return [];
}
function getModuleLinkHrefs(matches, manifest, { includeHydrateFallback } = {}) {
	return dedupeHrefs(matches.map((match) => {
		let route = manifest.routes[match.route.id];
		if (!route) return [];
		let hrefs = [route.module];
		if (route.clientActionModule) hrefs = hrefs.concat(route.clientActionModule);
		if (route.clientLoaderModule) hrefs = hrefs.concat(route.clientLoaderModule);
		if (includeHydrateFallback && route.hydrateFallbackModule) hrefs = hrefs.concat(route.hydrateFallbackModule);
		if (route.imports) hrefs = hrefs.concat(route.imports);
		return hrefs;
	}).flat(1));
}
function dedupeHrefs(hrefs) {
	return [...new Set(hrefs)];
}
function sortKeys(obj) {
	let sorted = {};
	let keys = Object.keys(obj).sort();
	for (let key of keys) sorted[key] = obj[key];
	return sorted;
}
function dedupeLinkDescriptors(descriptors, preloads) {
	let set = /* @__PURE__ */ new Set();
	let preloadsSet = new Set(preloads);
	return descriptors.reduce((deduped, descriptor) => {
		if (preloads && !isPageLinkDescriptor(descriptor) && descriptor.as === "script" && descriptor.href && preloadsSet.has(descriptor.href)) return deduped;
		let key = JSON.stringify(sortKeys(descriptor));
		if (!set.has(key)) {
			set.add(key);
			deduped.push({
				key,
				link: descriptor
			});
		}
		return deduped;
	}, []);
}
function useDataRouterContext2() {
	let context = import_react.useContext(DataRouterContext);
	invariant2(context, "You must render this element inside a <DataRouterContext.Provider> element");
	return context;
}
function useDataRouterStateContext() {
	let context = import_react.useContext(DataRouterStateContext);
	invariant2(context, "You must render this element inside a <DataRouterStateContext.Provider> element");
	return context;
}
var FrameworkContext = import_react.createContext(void 0);
FrameworkContext.displayName = "FrameworkContext";
function useFrameworkContext() {
	let context = import_react.useContext(FrameworkContext);
	invariant2(context, "You must render this element inside a <HydratedRouter> element");
	return context;
}
function usePrefetchBehavior(prefetch, theirElementProps) {
	let frameworkContext = import_react.useContext(FrameworkContext);
	let [maybePrefetch, setMaybePrefetch] = import_react.useState(false);
	let [shouldPrefetch, setShouldPrefetch] = import_react.useState(false);
	let { onFocus, onBlur, onMouseEnter, onMouseLeave, onTouchStart } = theirElementProps;
	let ref = import_react.useRef(null);
	import_react.useEffect(() => {
		if (prefetch === "render") setShouldPrefetch(true);
		if (prefetch === "viewport") {
			let callback = (entries) => {
				entries.forEach((entry) => {
					setShouldPrefetch(entry.isIntersecting);
				});
			};
			let observer = new IntersectionObserver(callback, { threshold: .5 });
			if (ref.current) observer.observe(ref.current);
			return () => {
				observer.disconnect();
			};
		}
	}, [prefetch]);
	import_react.useEffect(() => {
		if (maybePrefetch) {
			let id = setTimeout(() => {
				setShouldPrefetch(true);
			}, 100);
			return () => {
				clearTimeout(id);
			};
		}
	}, [maybePrefetch]);
	let setIntent = () => {
		setMaybePrefetch(true);
	};
	let cancelIntent = () => {
		setMaybePrefetch(false);
		setShouldPrefetch(false);
	};
	if (!frameworkContext) return [
		false,
		ref,
		{}
	];
	if (prefetch !== "intent") return [
		shouldPrefetch,
		ref,
		{}
	];
	return [
		shouldPrefetch,
		ref,
		{
			onFocus: composeEventHandlers(onFocus, setIntent),
			onBlur: composeEventHandlers(onBlur, cancelIntent),
			onMouseEnter: composeEventHandlers(onMouseEnter, setIntent),
			onMouseLeave: composeEventHandlers(onMouseLeave, cancelIntent),
			onTouchStart: composeEventHandlers(onTouchStart, setIntent)
		}
	];
}
function composeEventHandlers(theirHandler, ourHandler) {
	return (event) => {
		theirHandler && theirHandler(event);
		if (!event.defaultPrevented) ourHandler(event);
	};
}
function PrefetchPageLinks({ page, ...linkProps }) {
	let rsc = useIsRSCRouterContext();
	let { router } = useDataRouterContext2();
	let matches = import_react.useMemo(() => matchRoutes(router.routes, page, router.basename), [
		router.routes,
		page,
		router.basename
	]);
	if (!matches) return null;
	if (rsc) return /* @__PURE__ */ import_react.createElement(RSCPrefetchPageLinksImpl, {
		page,
		matches,
		...linkProps
	});
	return /* @__PURE__ */ import_react.createElement(PrefetchPageLinksImpl, {
		page,
		matches,
		...linkProps
	});
}
function useKeyedPrefetchLinks(matches) {
	let { manifest, routeModules } = useFrameworkContext();
	let [keyedPrefetchLinks, setKeyedPrefetchLinks] = import_react.useState([]);
	import_react.useEffect(() => {
		let interrupted = false;
		getKeyedPrefetchLinks(matches, manifest, routeModules).then((links) => {
			if (!interrupted) setKeyedPrefetchLinks(links);
		});
		return () => {
			interrupted = true;
		};
	}, [
		matches,
		manifest,
		routeModules
	]);
	return keyedPrefetchLinks;
}
function RSCPrefetchPageLinksImpl({ page, matches: nextMatches, ...linkProps }) {
	let location = useLocation();
	let { future } = useFrameworkContext();
	let { basename } = useDataRouterContext2();
	let dataHrefs = import_react.useMemo(() => {
		if (page === location.pathname + location.search + location.hash) return [];
		let url = singleFetchUrl(page, basename, future.unstable_trailingSlashAwareDataRequests, "rsc");
		let hasSomeRoutesWithShouldRevalidate = false;
		let targetRoutes = [];
		for (let match of nextMatches) if (typeof match.route.shouldRevalidate === "function") hasSomeRoutesWithShouldRevalidate = true;
		else targetRoutes.push(match.route.id);
		if (hasSomeRoutesWithShouldRevalidate && targetRoutes.length > 0) url.searchParams.set("_routes", targetRoutes.join(","));
		return [url.pathname + url.search];
	}, [
		basename,
		future.unstable_trailingSlashAwareDataRequests,
		page,
		location,
		nextMatches
	]);
	return /* @__PURE__ */ import_react.createElement(import_react.Fragment, null, dataHrefs.map((href) => /* @__PURE__ */ import_react.createElement("link", {
		key: href,
		rel: "prefetch",
		as: "fetch",
		href,
		...linkProps
	})));
}
function PrefetchPageLinksImpl({ page, matches: nextMatches, ...linkProps }) {
	let location = useLocation();
	let { future, manifest, routeModules } = useFrameworkContext();
	let { basename } = useDataRouterContext2();
	let { loaderData, matches } = useDataRouterStateContext();
	let newMatchesForData = import_react.useMemo(() => getNewMatchesForLinks(page, nextMatches, matches, manifest, location, "data"), [
		page,
		nextMatches,
		matches,
		manifest,
		location
	]);
	let newMatchesForAssets = import_react.useMemo(() => getNewMatchesForLinks(page, nextMatches, matches, manifest, location, "assets"), [
		page,
		nextMatches,
		matches,
		manifest,
		location
	]);
	let dataHrefs = import_react.useMemo(() => {
		if (page === location.pathname + location.search + location.hash) return [];
		let routesParams = /* @__PURE__ */ new Set();
		let foundOptOutRoute = false;
		nextMatches.forEach((m) => {
			let manifestRoute = manifest.routes[m.route.id];
			if (!manifestRoute || !manifestRoute.hasLoader) return;
			if (!newMatchesForData.some((m2) => m2.route.id === m.route.id) && m.route.id in loaderData && routeModules[m.route.id]?.shouldRevalidate) foundOptOutRoute = true;
			else if (manifestRoute.hasClientLoader) foundOptOutRoute = true;
			else routesParams.add(m.route.id);
		});
		if (routesParams.size === 0) return [];
		let url = singleFetchUrl(page, basename, future.unstable_trailingSlashAwareDataRequests, "data");
		if (foundOptOutRoute && routesParams.size > 0) url.searchParams.set("_routes", nextMatches.filter((m) => routesParams.has(m.route.id)).map((m) => m.route.id).join(","));
		return [url.pathname + url.search];
	}, [
		basename,
		future.unstable_trailingSlashAwareDataRequests,
		loaderData,
		location,
		manifest,
		newMatchesForData,
		nextMatches,
		page,
		routeModules
	]);
	let moduleHrefs = import_react.useMemo(() => getModuleLinkHrefs(newMatchesForAssets, manifest), [newMatchesForAssets, manifest]);
	let keyedPrefetchLinks = useKeyedPrefetchLinks(newMatchesForAssets);
	return /* @__PURE__ */ import_react.createElement(import_react.Fragment, null, dataHrefs.map((href) => /* @__PURE__ */ import_react.createElement("link", {
		key: href,
		rel: "prefetch",
		as: "fetch",
		href,
		...linkProps
	})), moduleHrefs.map((href) => /* @__PURE__ */ import_react.createElement("link", {
		key: href,
		rel: "modulepreload",
		href,
		...linkProps
	})), keyedPrefetchLinks.map(({ key, link }) => /* @__PURE__ */ import_react.createElement("link", {
		key,
		nonce: linkProps.nonce,
		...link,
		crossOrigin: link.crossOrigin ?? linkProps.crossOrigin
	})));
}
function mergeRefs(...refs) {
	return (value) => {
		refs.forEach((ref) => {
			if (typeof ref === "function") ref(value);
			else if (ref != null) ref.current = value;
		});
	};
}
import_react.Component;
var isBrowser2 = typeof window !== "undefined" && typeof window.document !== "undefined" && typeof window.document.createElement !== "undefined";
try {
	if (isBrowser2) window.__reactRouterVersion = "7.15.1";
} catch (e) {}
function BrowserRouter({ basename, children, useTransitions, window: window2 }) {
	let historyRef = import_react.useRef();
	if (historyRef.current == null) historyRef.current = createBrowserHistory({
		window: window2,
		v5Compat: true
	});
	let history = historyRef.current;
	let [state, setStateImpl] = import_react.useState({
		action: history.action,
		location: history.location
	});
	let setState = import_react.useCallback((newState) => {
		if (useTransitions === false) setStateImpl(newState);
		else import_react.startTransition(() => setStateImpl(newState));
	}, [useTransitions]);
	import_react.useLayoutEffect(() => history.listen(setState), [history, setState]);
	return /* @__PURE__ */ import_react.createElement(Router, {
		basename,
		children,
		location: state.location,
		navigationType: state.action,
		navigator: history,
		useTransitions
	});
}
function HistoryRouter({ basename, children, history, useTransitions }) {
	let [state, setStateImpl] = import_react.useState({
		action: history.action,
		location: history.location
	});
	let setState = import_react.useCallback((newState) => {
		if (useTransitions === false) setStateImpl(newState);
		else import_react.startTransition(() => setStateImpl(newState));
	}, [useTransitions]);
	import_react.useLayoutEffect(() => history.listen(setState), [history, setState]);
	return /* @__PURE__ */ import_react.createElement(Router, {
		basename,
		children,
		location: state.location,
		navigationType: state.action,
		navigator: history,
		useTransitions
	});
}
HistoryRouter.displayName = "unstable_HistoryRouter";
var ABSOLUTE_URL_REGEX2 = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;
var Link = import_react.forwardRef(function LinkWithRef({ onClick, discover = "render", prefetch = "none", relative, reloadDocument, replace: replace2, mask, state, target, to, preventScrollReset, viewTransition, defaultShouldRevalidate, ...rest }, forwardedRef) {
	let { basename, navigator, useTransitions } = import_react.useContext(NavigationContext);
	let isAbsolute = typeof to === "string" && ABSOLUTE_URL_REGEX2.test(to);
	let parsed = parseToInfo(to, basename);
	to = parsed.to;
	let href = useHref(to, { relative });
	let location = useLocation();
	let maskedHref = null;
	if (mask) {
		let resolved = resolveTo(mask, [], location.mask ? location.mask.pathname : "/", true);
		if (basename !== "/") resolved.pathname = resolved.pathname === "/" ? basename : joinPaths([basename, resolved.pathname]);
		maskedHref = navigator.createHref(resolved);
	}
	let [shouldPrefetch, prefetchRef, prefetchHandlers] = usePrefetchBehavior(prefetch, rest);
	let internalOnClick = useLinkClickHandler(to, {
		replace: replace2,
		mask,
		state,
		target,
		preventScrollReset,
		relative,
		viewTransition,
		defaultShouldRevalidate,
		useTransitions
	});
	function handleClick(event) {
		if (onClick) onClick(event);
		if (!event.defaultPrevented) internalOnClick(event);
	}
	let isSpaLink = !(parsed.isExternal || reloadDocument);
	let link = /* @__PURE__ */ import_react.createElement("a", {
		...rest,
		...prefetchHandlers,
		href: (isSpaLink ? maskedHref : void 0) || parsed.absoluteURL || href,
		onClick: isSpaLink ? handleClick : onClick,
		ref: mergeRefs(forwardedRef, prefetchRef),
		target,
		"data-discover": !isAbsolute && discover === "render" ? "true" : void 0
	});
	return shouldPrefetch && !isAbsolute ? /* @__PURE__ */ import_react.createElement(import_react.Fragment, null, link, /* @__PURE__ */ import_react.createElement(PrefetchPageLinks, { page: href })) : link;
});
Link.displayName = "Link";
var NavLink = import_react.forwardRef(function NavLinkWithRef({ "aria-current": ariaCurrentProp = "page", caseSensitive = false, className: classNameProp = "", end = false, style: styleProp, to, viewTransition, children, ...rest }, ref) {
	let path = useResolvedPath(to, { relative: rest.relative });
	let location = useLocation();
	let routerState = import_react.useContext(DataRouterStateContext);
	let { navigator, basename } = import_react.useContext(NavigationContext);
	let isTransitioning = routerState != null && useViewTransitionState(path) && viewTransition === true;
	let toPathname = navigator.encodeLocation ? navigator.encodeLocation(path).pathname : path.pathname;
	let locationPathname = location.pathname;
	let nextLocationPathname = routerState && routerState.navigation && routerState.navigation.location ? routerState.navigation.location.pathname : null;
	if (!caseSensitive) {
		locationPathname = locationPathname.toLowerCase();
		nextLocationPathname = nextLocationPathname ? nextLocationPathname.toLowerCase() : null;
		toPathname = toPathname.toLowerCase();
	}
	if (nextLocationPathname && basename) nextLocationPathname = stripBasename(nextLocationPathname, basename) || nextLocationPathname;
	const endSlashPosition = toPathname !== "/" && toPathname.endsWith("/") ? toPathname.length - 1 : toPathname.length;
	let isActive = locationPathname === toPathname || !end && locationPathname.startsWith(toPathname) && locationPathname.charAt(endSlashPosition) === "/";
	let isPending = nextLocationPathname != null && (nextLocationPathname === toPathname || !end && nextLocationPathname.startsWith(toPathname) && nextLocationPathname.charAt(toPathname.length) === "/");
	let renderProps = {
		isActive,
		isPending,
		isTransitioning
	};
	let ariaCurrent = isActive ? ariaCurrentProp : void 0;
	let className;
	if (typeof classNameProp === "function") className = classNameProp(renderProps);
	else className = [
		classNameProp,
		isActive ? "active" : null,
		isPending ? "pending" : null,
		isTransitioning ? "transitioning" : null
	].filter(Boolean).join(" ");
	let style = typeof styleProp === "function" ? styleProp(renderProps) : styleProp;
	return /* @__PURE__ */ import_react.createElement(Link, {
		...rest,
		"aria-current": ariaCurrent,
		className,
		ref,
		style,
		to,
		viewTransition
	}, typeof children === "function" ? children(renderProps) : children);
});
NavLink.displayName = "NavLink";
var Form = import_react.forwardRef(({ discover = "render", fetcherKey, navigate, reloadDocument, replace: replace2, state, method = defaultMethod, action, onSubmit, relative, preventScrollReset, viewTransition, defaultShouldRevalidate, ...props }, forwardedRef) => {
	let { useTransitions } = import_react.useContext(NavigationContext);
	let submit = useSubmit();
	let formAction = useFormAction(action, { relative });
	let formMethod = method.toLowerCase() === "get" ? "get" : "post";
	let isAbsolute = typeof action === "string" && ABSOLUTE_URL_REGEX2.test(action);
	let submitHandler = (event) => {
		onSubmit && onSubmit(event);
		if (event.defaultPrevented) return;
		event.preventDefault();
		let submitter = event.nativeEvent.submitter;
		let submitMethod = submitter?.getAttribute("formmethod") || method;
		let doSubmit = () => submit(submitter || event.currentTarget, {
			fetcherKey,
			method: submitMethod,
			navigate,
			replace: replace2,
			state,
			relative,
			preventScrollReset,
			viewTransition,
			defaultShouldRevalidate
		});
		if (useTransitions && navigate !== false) import_react.startTransition(() => doSubmit());
		else doSubmit();
	};
	return /* @__PURE__ */ import_react.createElement("form", {
		ref: forwardedRef,
		method: formMethod,
		action: formAction,
		onSubmit: reloadDocument ? onSubmit : submitHandler,
		...props,
		"data-discover": !isAbsolute && discover === "render" ? "true" : void 0
	});
});
Form.displayName = "Form";
function ScrollRestoration({ getKey, storageKey, ...props }) {
	let remixContext = import_react.useContext(FrameworkContext);
	let { basename } = import_react.useContext(NavigationContext);
	let location = useLocation();
	let matches = useMatches();
	useScrollRestoration({
		getKey,
		storageKey
	});
	let ssrKey = import_react.useMemo(() => {
		if (!remixContext || !getKey) return null;
		let userKey = getScrollRestorationKey(location, matches, basename, getKey);
		return userKey !== location.key ? userKey : null;
	}, []);
	if (!remixContext || remixContext.isSpaMode) return null;
	let restoreScroll = ((storageKey2, restoreKey) => {
		if (!window.history.state || !window.history.state.key) {
			let key = Math.random().toString(32).slice(2);
			window.history.replaceState({ key }, "");
		}
		try {
			let storedY = JSON.parse(sessionStorage.getItem(storageKey2) || "{}")[restoreKey || window.history.state.key];
			if (typeof storedY === "number") window.scrollTo(0, storedY);
		} catch (error) {
			console.error(error);
			sessionStorage.removeItem(storageKey2);
		}
	}).toString();
	return /* @__PURE__ */ import_react.createElement("script", {
		...props,
		suppressHydrationWarning: true,
		dangerouslySetInnerHTML: { __html: `(${restoreScroll})(${escapeHtml(JSON.stringify(storageKey || SCROLL_RESTORATION_STORAGE_KEY))}, ${escapeHtml(JSON.stringify(ssrKey))})` }
	});
}
ScrollRestoration.displayName = "ScrollRestoration";
function getDataRouterConsoleError2(hookName) {
	return `${hookName} must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.`;
}
function useDataRouterContext3(hookName) {
	let ctx = import_react.useContext(DataRouterContext);
	invariant(ctx, getDataRouterConsoleError2(hookName));
	return ctx;
}
function useDataRouterState2(hookName) {
	let state = import_react.useContext(DataRouterStateContext);
	invariant(state, getDataRouterConsoleError2(hookName));
	return state;
}
function useLinkClickHandler(to, { target, replace: replaceProp, mask, state, preventScrollReset, relative, viewTransition, defaultShouldRevalidate, useTransitions } = {}) {
	let navigate = useNavigate();
	let location = useLocation();
	let path = useResolvedPath(to, { relative });
	return import_react.useCallback((event) => {
		if (shouldProcessLinkClick(event, target)) {
			event.preventDefault();
			let replace2 = replaceProp !== void 0 ? replaceProp : createPath(location) === createPath(path);
			let doNavigate = () => navigate(to, {
				replace: replace2,
				mask,
				state,
				preventScrollReset,
				relative,
				viewTransition,
				defaultShouldRevalidate
			});
			if (useTransitions) import_react.startTransition(() => doNavigate());
			else doNavigate();
		}
	}, [
		location,
		navigate,
		path,
		replaceProp,
		mask,
		state,
		target,
		to,
		preventScrollReset,
		relative,
		viewTransition,
		defaultShouldRevalidate,
		useTransitions
	]);
}
var fetcherId = 0;
var getUniqueFetcherId = () => `__${String(++fetcherId)}__`;
function useSubmit() {
	let { router } = useDataRouterContext3("useSubmit");
	let { basename } = import_react.useContext(NavigationContext);
	let currentRouteId = useRouteId();
	let routerFetch = router.fetch;
	let routerNavigate = router.navigate;
	return import_react.useCallback(async (target, options = {}) => {
		let { action, method, encType, formData, body } = getFormSubmissionInfo(target, basename);
		if (options.navigate === false) await routerFetch(options.fetcherKey || getUniqueFetcherId(), currentRouteId, options.action || action, {
			defaultShouldRevalidate: options.defaultShouldRevalidate,
			preventScrollReset: options.preventScrollReset,
			formData,
			body,
			formMethod: options.method || method,
			formEncType: options.encType || encType,
			flushSync: options.flushSync
		});
		else await routerNavigate(options.action || action, {
			defaultShouldRevalidate: options.defaultShouldRevalidate,
			preventScrollReset: options.preventScrollReset,
			formData,
			body,
			formMethod: options.method || method,
			formEncType: options.encType || encType,
			replace: options.replace,
			state: options.state,
			fromRouteId: currentRouteId,
			flushSync: options.flushSync,
			viewTransition: options.viewTransition
		});
	}, [
		routerFetch,
		routerNavigate,
		basename,
		currentRouteId
	]);
}
function useFormAction(action, { relative } = {}) {
	let { basename } = import_react.useContext(NavigationContext);
	let routeContext = import_react.useContext(RouteContext);
	invariant(routeContext, "useFormAction must be used inside a RouteContext");
	let [match] = routeContext.matches.slice(-1);
	let path = { ...useResolvedPath(action ? action : ".", { relative }) };
	let location = useLocation();
	if (action == null) {
		path.search = location.search;
		let params = new URLSearchParams(path.search);
		let indexValues = params.getAll("index");
		if (indexValues.some((v) => v === "")) {
			params.delete("index");
			indexValues.filter((v) => v).forEach((v) => params.append("index", v));
			let qs = params.toString();
			path.search = qs ? `?${qs}` : "";
		}
	}
	if ((!action || action === ".") && match.route.index) path.search = path.search ? path.search.replace(/^\?/, "?index&") : "?index";
	if (basename !== "/") path.pathname = path.pathname === "/" ? basename : joinPaths([basename, path.pathname]);
	return createPath(path);
}
var SCROLL_RESTORATION_STORAGE_KEY = "react-router-scroll-positions";
var savedScrollPositions = {};
function getScrollRestorationKey(location, matches, basename, getKey) {
	let key = null;
	if (getKey) if (basename !== "/") key = getKey({
		...location,
		pathname: stripBasename(location.pathname, basename) || location.pathname
	}, matches);
	else key = getKey(location, matches);
	if (key == null) key = location.key;
	return key;
}
function useScrollRestoration({ getKey, storageKey } = {}) {
	let { router } = useDataRouterContext3("useScrollRestoration");
	let { restoreScrollPosition, preventScrollReset } = useDataRouterState2("useScrollRestoration");
	let { basename } = import_react.useContext(NavigationContext);
	let location = useLocation();
	let matches = useMatches();
	let navigation = useNavigation();
	import_react.useEffect(() => {
		window.history.scrollRestoration = "manual";
		return () => {
			window.history.scrollRestoration = "auto";
		};
	}, []);
	usePageHide(import_react.useCallback(() => {
		if (navigation.state === "idle") {
			let key = getScrollRestorationKey(location, matches, basename, getKey);
			savedScrollPositions[key] = window.scrollY;
		}
		try {
			sessionStorage.setItem(storageKey || SCROLL_RESTORATION_STORAGE_KEY, JSON.stringify(savedScrollPositions));
		} catch (error) {
			warning(false, `Failed to save scroll positions in sessionStorage, <ScrollRestoration /> will not work properly (${error}).`);
		}
		window.history.scrollRestoration = "auto";
	}, [
		navigation.state,
		getKey,
		basename,
		location,
		matches,
		storageKey
	]));
	if (typeof document !== "undefined") {
		import_react.useLayoutEffect(() => {
			try {
				let sessionPositions = sessionStorage.getItem(storageKey || SCROLL_RESTORATION_STORAGE_KEY);
				if (sessionPositions) savedScrollPositions = JSON.parse(sessionPositions);
			} catch (e) {}
		}, [storageKey]);
		import_react.useLayoutEffect(() => {
			let disableScrollRestoration = router?.enableScrollRestoration(savedScrollPositions, () => window.scrollY, getKey ? (location2, matches2) => getScrollRestorationKey(location2, matches2, basename, getKey) : void 0);
			return () => disableScrollRestoration && disableScrollRestoration();
		}, [
			router,
			basename,
			getKey
		]);
		import_react.useLayoutEffect(() => {
			if (restoreScrollPosition === false) return;
			if (typeof restoreScrollPosition === "number") {
				window.scrollTo(0, restoreScrollPosition);
				return;
			}
			try {
				if (location.hash) {
					let el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
					if (el) {
						el.scrollIntoView();
						return;
					}
				}
			} catch {
				warning(false, `"${location.hash.slice(1)}" is not a decodable element ID. The view will not scroll to it.`);
			}
			if (preventScrollReset === true) return;
			window.scrollTo(0, 0);
		}, [
			location,
			restoreScrollPosition,
			preventScrollReset
		]);
	}
}
function usePageHide(callback, options) {
	let { capture } = options || {};
	import_react.useEffect(() => {
		let opts = capture != null ? { capture } : void 0;
		window.addEventListener("pagehide", callback, opts);
		return () => {
			window.removeEventListener("pagehide", callback, opts);
		};
	}, [callback, capture]);
}
function useViewTransitionState(to, { relative } = {}) {
	let vtContext = import_react.useContext(ViewTransitionContext);
	invariant(vtContext != null, "`useViewTransitionState` must be used within `react-router-dom`'s `RouterProvider`.  Did you accidentally import `RouterProvider` from `react-router`?");
	let { basename } = useDataRouterContext3("useViewTransitionState");
	let path = useResolvedPath(to, { relative });
	if (!vtContext.isTransitioning) return false;
	let currentPath = stripBasename(vtContext.currentLocation.pathname, basename) || vtContext.currentLocation.pathname;
	let nextPath = stripBasename(vtContext.nextLocation.pathname, basename) || vtContext.nextLocation.pathname;
	return matchPath(path.pathname, nextPath) != null || matchPath(path.pathname, currentPath) != null;
}
//#endregion
//#region src/components/DebugPanel.tsx
var GLOBAL_SCOPE_RE = /\[作用域[：:]\s*全局/;
function classifyScope(tool) {
	return GLOBAL_SCOPE_RE.test(tool.description) ? "global" : "local";
}
function readTools() {
	if (typeof navigator === "undefined" || !("modelContext" in navigator)) return [];
	const mc = navigator.modelContext;
	if (!mc || typeof mc.listTools !== "function") return [];
	try {
		return (mc.listTools() ?? []).map((t) => ({
			name: t.name,
			description: t.description ?? "",
			inputSchema: typeof t.inputSchema === "string" ? safeParse(t.inputSchema) : t.inputSchema ?? void 0
		}));
	} catch {
		return [];
	}
}
function safeParse(s) {
	try {
		return JSON.parse(s);
	} catch {
		return;
	}
}
function getPropType(p) {
	if (Array.isArray(p.type)) return p.type.find((t) => t !== "null") ?? "string";
	return p.type ?? "string";
}
function defaultValueForProp(p) {
	if (p.default !== void 0) return typeof p.default === "string" ? p.default : JSON.stringify(p.default);
	return "";
}
async function callTool(name, argsJson) {
	if (typeof navigator === "undefined") throw new Error("navigator 不可用");
	const mct = navigator.modelContextTesting;
	if (!mct || typeof mct.executeTool !== "function") throw new Error("navigator.modelContextTesting.executeTool 不可用");
	const result = await mct.executeTool(name, argsJson);
	if (result === null) return "(工具触发了页面跳转)";
	return String(result);
}
function DebugPanel({ open, onToggle }) {
	const [tools, setTools] = (0, import_react.useState)([]);
	const [expanded, setExpanded] = (0, import_react.useState)({});
	const [activeScope, setActiveScope] = (0, import_react.useState)("global");
	const [query, setQuery] = (0, import_react.useState)("");
	const [formValues, setFormValues] = (0, import_react.useState)({});
	const [invocations, setInvocations] = (0, import_react.useState)({});
	(0, import_react.useEffect)(() => {
		const refresh = () => setTools(readTools());
		refresh();
		if (typeof navigator === "undefined" || !("modelContext" in navigator)) return;
		const mc = navigator.modelContext;
		if (!mc) return;
		const events = ["toolchange", "toolschanged"];
		if (typeof mc.addEventListener === "function") for (const ev of events) mc.addEventListener(ev, refresh);
		const timer = setInterval(refresh, 250);
		return () => {
			if (typeof mc.removeEventListener === "function") for (const ev of events) mc.removeEventListener(ev, refresh);
			clearInterval(timer);
		};
	}, []);
	const grouped = (0, import_react.useMemo)(() => {
		const lower = query.toLowerCase();
		const matches = (t) => !query || (t.name + " " + t.description).toLowerCase().includes(lower);
		const global = [];
		const local = [];
		for (const t of tools) {
			if (!matches(t)) continue;
			(classifyScope(t) === "global" ? global : local).push(t);
		}
		const sortByName = (a, b) => a.name.localeCompare(b.name);
		global.sort(sortByName);
		local.sort(sortByName);
		return {
			global,
			local
		};
	}, [tools, query]);
	const totals = (0, import_react.useMemo)(() => {
		let g = 0;
		let l = 0;
		for (const t of tools) if (classifyScope(t) === "global") g++;
		else l++;
		return {
			global: g,
			local: l
		};
	}, [tools]);
	const setFieldValue = (toolName, field, value) => {
		setFormValues((prev) => ({
			...prev,
			[toolName]: {
				...prev[toolName] ?? {},
				[field]: value
			}
		}));
	};
	const buildArgs = (tool) => {
		const props = tool.inputSchema?.properties ?? {};
		const required = new Set(tool.inputSchema?.required ?? []);
		const values = formValues[tool.name] ?? {};
		const out = {};
		for (const [key, schema] of Object.entries(props)) {
			const raw = values[key];
			if (raw === void 0 || raw === "") {
				if (required.has(key)) return {
					json: "",
					error: `字段 "${key}" 是必填项`
				};
				continue;
			}
			const type = getPropType(schema);
			try {
				if (type === "number" || type === "integer") {
					const n = Number(raw);
					if (Number.isNaN(n)) return {
						json: "",
						error: `"${key}" 不是合法数字`
					};
					out[key] = type === "integer" ? Math.trunc(n) : n;
				} else if (type === "boolean") out[key] = raw === "true";
				else if (type === "array" || type === "object") out[key] = JSON.parse(raw);
				else out[key] = raw;
			} catch (e) {
				return {
					json: "",
					error: `"${key}" JSON 解析失败：${e.message}`
				};
			}
		}
		return { json: JSON.stringify(out) };
	};
	const execute = async (tool) => {
		const { json, error } = buildArgs(tool);
		if (error) {
			setInvocations((prev) => ({
				...prev,
				[tool.name]: {
					running: false,
					result: null,
					error,
					ranAt: Date.now()
				}
			}));
			return;
		}
		setInvocations((prev) => ({
			...prev,
			[tool.name]: {
				running: true,
				result: null,
				error: null,
				ranAt: null
			}
		}));
		try {
			const result = await callTool(tool.name, json);
			setInvocations((prev) => ({
				...prev,
				[tool.name]: {
					running: false,
					result,
					error: null,
					ranAt: Date.now()
				}
			}));
		} catch (e) {
			setInvocations((prev) => ({
				...prev,
				[tool.name]: {
					running: false,
					result: null,
					error: e.message,
					ranAt: Date.now()
				}
			}));
		}
	};
	const renderScope = (key, list) => {
		const isActive = activeScope === key;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: `debug-scope debug-scope--${key} ${isActive ? "is-active" : ""}`,
			"data-testid": `debug-group-${key}`,
			"aria-hidden": !isActive,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "debug-list",
				"data-testid": `debug-tool-list-${key}`,
				children: list.map((t) => renderToolItem(t))
			}), list.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "muted debug-scope__empty",
				children: query ? "没有匹配的工具。" : "当前作用域下暂无工具。"
			})]
		});
	};
	const renderTab = (key, label) => {
		const matched = key === "global" ? grouped.global.length : grouped.local.length;
		const total = key === "global" ? totals.global : totals.local;
		const showFraction = !!query && matched !== total;
		const isActive = activeScope === key;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: `debug-tab debug-tab--${key} ${isActive ? "is-active" : ""}`,
			onClick: () => setActiveScope(key),
			"aria-pressed": isActive,
			"aria-controls": `debug-tool-list-${key}`,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "debug-tab__label",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "debug-tab__count",
				"data-testid": `debug-group-count-${key}`,
				title: showFraction ? `匹配 ${matched} / 全部 ${total}` : `共 ${total} 个`,
				children: showFraction ? `${matched}/${total}` : total
			})]
		}, key);
	};
	const renderToolItem = (t) => {
		const isOpen = !!expanded[t.name];
		const inv = invocations[t.name];
		const props = t.inputSchema?.properties ?? {};
		const required = new Set(t.inputSchema?.required ?? []);
		const values = formValues[t.name] ?? {};
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "debug-item",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "debug-item__head",
					onClick: () => setExpanded((s) => ({
						...s,
						[t.name]: !s[t.name]
					})),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
						className: "debug-item__name",
						children: t.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "debug-item__chev",
						children: isOpen ? "−" : "+"
					})]
				}),
				t.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "debug-item__desc",
					children: t.description
				}),
				isOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "debug-item__body",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "debug-item__form",
							children: Object.keys(props).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "debug-item__noargs",
								children: "无入参"
							}) : Object.entries(props).map(([key, schema]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SchemaField, {
								fieldKey: key,
								schema,
								required: required.has(key),
								value: values[key] ?? defaultValueForProp(schema),
								onChange: (v) => setFieldValue(t.name, key, v)
							}, key))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "debug-item__exec-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "primary-btn debug-item__exec",
								onClick: () => execute(t),
								disabled: inv?.running,
								children: inv?.running ? "执行中…" : "执行"
							}), inv?.ranAt && !inv.running && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "debug-item__ts",
								children: new Date(inv.ranAt).toLocaleTimeString()
							})]
						}),
						inv?.error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
							className: "debug-item__result debug-item__result--error",
							children: inv.error
						}),
						inv?.result && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
							className: "debug-item__result",
							children: inv.result
						})
					]
				})
			]
		}, t.name);
	};
	const matchedCount = grouped.global.length + grouped.local.length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [!open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		className: "debug-fab",
		onClick: onToggle,
		"aria-label": "打开调试面板",
		children: "⌘\\"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: `debug-panel ${open ? "is-open" : ""}`,
		"aria-hidden": !open,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "debug-panel__head",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "WebMCP 工具调试" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "muted",
					children: [
						"当前可用 ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: tools.length }),
						" 个工具。"
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "ghost-btn",
					onClick: onToggle,
					children: "收起"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "debug-panel__search",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "search",
					value: query,
					onChange: (e) => setQuery(e.target.value),
					placeholder: "过滤工具名 / 描述…",
					"aria-label": "过滤调试工具列表"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "debug-tabs",
				role: "tablist",
				"aria-label": "工具作用域",
				children: [renderTab("global", "全局"), renderTab("local", "页面 / 组件")]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "debug-panel__body",
				"data-testid": "debug-tool-list",
				children: [
					renderScope("global", grouped.global),
					renderScope("local", grouped.local),
					matchedCount === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "muted debug-panel__empty",
						children: "没有匹配的工具。试试切换页面或挂载新组件。"
					})
				]
			})
		]
	})] });
}
function SchemaField({ fieldKey, schema, required, value, onChange }) {
	const type = getPropType(schema);
	const id = `dbg-${fieldKey}`;
	const placeholder = type === "array" || type === "object" ? `${type === "array" ? "[…]" : "{…}"} JSON` : schema.description ?? type;
	let control;
	if (schema.enum && schema.enum.length > 0) control = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
		id,
		value,
		onChange: (e) => onChange(e.target.value),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
			value: "",
			children: "— 选择 —"
		}), schema.enum.map((opt) => {
			const s = String(opt);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
				value: s,
				children: s
			}, s);
		})]
	});
	else if (type === "boolean") control = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
		id,
		value,
		onChange: (e) => onChange(e.target.value),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
				value: "",
				children: "— 选择 —"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
				value: "true",
				children: "true"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
				value: "false",
				children: "false"
			})
		]
	});
	else if (type === "number" || type === "integer") control = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		id,
		type: "number",
		value,
		placeholder,
		onChange: (e) => onChange(e.target.value)
	});
	else if (type === "array" || type === "object") control = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		id,
		rows: 2,
		value,
		placeholder,
		onChange: (e) => onChange(e.target.value)
	});
	else control = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		id,
		type: "text",
		value,
		placeholder,
		onChange: (e) => onChange(e.target.value)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "debug-field",
		htmlFor: id,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "debug-field__label",
				children: [
					fieldKey,
					required && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", {
						className: "debug-field__req",
						children: "*"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "debug-field__type",
						children: type
					})
				]
			}),
			control,
			schema.description && !placeholder.startsWith(schema.description) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "debug-field__desc",
				children: schema.description
			})
		]
	});
}
//#endregion
//#region src/components/Badge.tsx
function Badge({ color = "#64748b", tone = "soft", children, title }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "badge",
		style: tone === "soft" ? {
			color,
			background: hexAlpha(color, .12),
			borderColor: "transparent"
		} : tone === "outline" ? {
			color,
			background: "transparent",
			borderColor: hexAlpha(color, .3)
		} : {
			color: "#fff",
			background: color,
			borderColor: color
		},
		title,
		children
	});
}
function hexAlpha(hex, a) {
	const m = /^#([0-9a-f]{6})$/i.exec(hex);
	if (!m) return hex;
	const n = parseInt(m[1], 16);
	return `rgba(${n >> 16 & 255}, ${n >> 8 & 255}, ${n & 255}, ${a})`;
}
//#endregion
//#region src/components/CopyableId.tsx
function CopyableId({ id, label = "ID" }) {
	const [copied, setCopied] = (0, import_react.useState)(false);
	const timerRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => () => {
		if (timerRef.current) window.clearTimeout(timerRef.current);
	}, []);
	const copy = async (e) => {
		e.stopPropagation();
		e.preventDefault();
		try {
			await navigator.clipboard.writeText(id);
		} catch {
			const ta = document.createElement("textarea");
			ta.value = id;
			ta.style.position = "fixed";
			ta.style.opacity = "0";
			document.body.appendChild(ta);
			ta.select();
			try {
				document.execCommand("copy");
			} catch {}
			document.body.removeChild(ta);
		}
		setCopied(true);
		if (timerRef.current) window.clearTimeout(timerRef.current);
		timerRef.current = window.setTimeout(() => setCopied(false), 1400);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		className: `copy-id ${copied ? "is-copied" : ""}`,
		onClick: copy,
		onMouseDown: (e) => e.stopPropagation(),
		title: `点击复制 ${label}：${id}`,
		"aria-label": `${copied ? "已复制" : "复制"} ${label}：${id}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "copy-id__text",
			children: copied ? "已复制" : `#${id}`
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "copy-id__icon",
			"aria-hidden": "true",
			children: copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
				width: "10",
				height: "10",
				viewBox: "0 0 16 16",
				fill: "none",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M3 8.5l3.2 3.2L13 5",
					stroke: "currentColor",
					strokeWidth: "2",
					strokeLinecap: "round",
					strokeLinejoin: "round"
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
				width: "10",
				height: "10",
				viewBox: "0 0 16 16",
				fill: "none",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "5",
					y: "5",
					width: "9",
					height: "9",
					rx: "1.6",
					stroke: "currentColor",
					strokeWidth: "1.4"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M11 5V3.3A1.3 1.3 0 0 0 9.7 2H3.3A1.3 1.3 0 0 0 2 3.3v6.4A1.3 1.3 0 0 0 3.3 11H5",
					stroke: "currentColor",
					strokeWidth: "1.4",
					strokeLinecap: "round"
				})]
			})
		})]
	});
}
//#endregion
//#region src/components/TaskCard.tsx
var PRIORITY_COLOR = {
	urgent: "#dc2626",
	high: "#c2410c",
	medium: "#2f6f5e",
	low: "#64748b"
};
var STATUS_COLOR = {
	todo: "#64748b",
	in_progress: "#0ea5e9",
	done: "#16a34a",
	archived: "#94a3b8"
};
function TaskCard({ task, onClick }) {
	const { projects, tags, setTaskStatus, deleteTask } = useTodoStore();
	const project = projects.find((p) => p.id === task.projectId);
	const taskTags = tags.filter((t) => task.tagIds.includes(t.id));
	const overdue = task.dueDate && task.status !== "done" && task.status !== "archived" ? task.dueDate.slice(0, 10) < (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) : false;
	const dueLabel = task.dueDate ? task.dueDate.length >= 16 ? `${task.dueDate.slice(0, 10)} ${task.dueDate.slice(11, 16)}` : task.dueDate : "无截止";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: `task-card task-card--${task.status} ${overdue ? "task-card--overdue" : ""}`,
		onClick: () => onClick?.(task),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "task-card__head",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "task-card__title-wrap",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "task-card__title",
						children: task.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyableId, {
						id: task.id,
						label: "Task ID"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "task-card__badges",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						color: PRIORITY_COLOR[task.priority],
						tone: "soft",
						children: PRIORITY_LABEL[task.priority]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						color: STATUS_COLOR[task.status],
						tone: "outline",
						children: STATUS_LABEL[task.status]
					})]
				})]
			}),
			task.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "task-card__desc",
				children: task.description
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "task-card__foot",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "task-card__meta",
					children: [project && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "task-card__project",
						title: project.description,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "dot",
								style: { background: project.color }
							}),
							" ",
							project.name
						]
					}), taskTags.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "task-card__tags",
						children: taskTags.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							color: t.color,
							tone: "soft",
							children: ["#", t.name]
						}, t.id))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "task-card__side",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: `task-card__due ${overdue ? "is-overdue" : ""}`,
						children: dueLabel
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "task-card__assignee",
						children: task.assignee
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "task-card__actions",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					value: task.status,
					onChange: (e) => {
						e.stopPropagation();
						setTaskStatus({
							id: task.id,
							status: e.target.value
						});
					},
					onClick: (e) => e.stopPropagation(),
					"aria-label": "状态",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "todo",
							children: "待办"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "in_progress",
							children: "进行中"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "done",
							children: "已完成"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "archived",
							children: "已归档"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "ghost-btn",
					onClick: (e) => {
						e.stopPropagation();
						deleteTask({ id: task.id });
					},
					children: "删除"
				})]
			})
		]
	});
}
//#endregion
//#region src/components/TaskFormDialog.tsx
function TaskFormDialog({ open, initialProjectId, editingTask, onClose }) {
	const { projects, tags, createTask, updateTask } = useTodoStore();
	const [title, setTitle] = (0, import_react.useState)("");
	const [description, setDescription] = (0, import_react.useState)("");
	const [projectId, setProjectId] = (0, import_react.useState)(initialProjectId ?? "p_inbox");
	const [priority, setPriority] = (0, import_react.useState)("medium");
	const [status, setStatus] = (0, import_react.useState)("todo");
	const [dueDate, setDueDate] = (0, import_react.useState)("");
	const [assignee, setAssignee] = (0, import_react.useState)("刺秦");
	const [tagIds, setTagIds] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		if (editingTask) {
			setTitle(editingTask.title);
			setDescription(editingTask.description);
			setProjectId(editingTask.projectId);
			setPriority(editingTask.priority);
			setStatus(editingTask.status);
			setDueDate(editingTask.dueDate ?? "");
			setAssignee(editingTask.assignee);
			setTagIds(editingTask.tagIds);
		} else {
			setTitle("");
			setDescription("");
			setProjectId(initialProjectId ?? "p_inbox");
			setPriority("medium");
			setStatus("todo");
			setDueDate("");
			setAssignee("刺秦");
			setTagIds([]);
		}
	}, [
		open,
		editingTask,
		initialProjectId
	]);
	if (!open) return null;
	const submit = (e) => {
		e.preventDefault();
		if (!title.trim()) return;
		const payload = {
			title: title.trim(),
			description: description.trim(),
			projectId,
			priority,
			status,
			dueDate: dueDate || null,
			assignee,
			tagIds
		};
		if (editingTask) updateTask({
			id: editingTask.id,
			...payload
		});
		else createTask(payload);
		onClose();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "modal-backdrop",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "modal",
			onClick: (e) => e.stopPropagation(),
			onSubmit: submit,
			"aria-label": editingTask ? "编辑任务" : "新建任务",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "modal__title",
					children: editingTask ? "编辑任务" : "新建任务"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "field",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "标题" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: title,
						onChange: (e) => setTitle(e.target.value),
						autoFocus: true,
						required: true
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "field",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "描述" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						value: description,
						onChange: (e) => setDescription(e.target.value),
						rows: 3
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "field-row",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "field",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "项目" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: projectId,
							onChange: (e) => setProjectId(e.target.value),
							children: projects.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: p.id,
								children: p.name
							}, p.id))
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "field",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "负责人" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: assignee,
							onChange: (e) => setAssignee(e.target.value)
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "field-row",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "field",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "优先级" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								value: priority,
								onChange: (e) => setPriority(e.target.value),
								children: [
									"urgent",
									"high",
									"medium",
									"low"
								].map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: p,
									children: PRIORITY_LABEL[p]
								}, p))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "field",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "状态" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								value: status,
								onChange: (e) => setStatus(e.target.value),
								children: [
									"todo",
									"in_progress",
									"done",
									"archived"
								].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: s,
									children: STATUS_LABEL[s]
								}, s))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "field",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "截止时间" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "datetime-local",
								value: dueDate,
								onChange: (e) => setDueDate(e.target.value)
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "field",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "标签" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "chip-row",
						children: tags.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: `chip ${tagIds.includes(t.id) ? "is-active" : ""}`,
							onClick: () => setTagIds((prev) => prev.includes(t.id) ? prev.filter((x) => x !== t.id) : [...prev, t.id]),
							children: ["#", t.name]
						}, t.id))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "modal__actions",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "ghost-btn",
						onClick: onClose,
						children: "取消"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						className: "primary-btn",
						children: editingTask ? "保存" : "创建"
					})]
				})
			]
		})
	});
}
//#endregion
//#region src/pages/DashboardPage.tsx
function DashboardPage() {
	const { tasks, projects, createTask, setTaskStatus } = useTodoStore();
	const navigate = useNavigate();
	const [creating, setCreating] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	/**
	* [作用域：工作台页] 打开新建任务弹窗（让用户在弹窗里继续手动填写）。
	*/
	const openTaskCreator = (0, import_react.useCallback)(async () => {
		setCreating(true);
		return { opened: true };
	}, []);
	/**
	* [作用域：工作台页] 关闭当前打开的新建 / 编辑任务弹窗。
	*/
	const closeTaskDialog = (0, import_react.useCallback)(async () => {
		setCreating(false);
		setEditing(null);
		return { closed: true };
	}, []);
	createTask.__webmcpSchema = {
		"description": "新建任务（写入全局任务列表）",
		"inputSchema": {
			"type": "object",
			"properties": {
				"title": {
					"type": "string",
					"description": "任务标题"
				},
				"description": {
					"type": "string",
					"description": "任务描述"
				},
				"projectId": {
					"type": "string",
					"description": "所属项目 ID（默认 p_inbox 收件箱）"
				},
				"tagIds": {
					"type": "array",
					"description": "标签 ID 列表"
				},
				"priority": {
					"type": "string",
					"description": "优先级",
					"enum": [
						"low",
						"medium",
						"high",
						"urgent"
					]
				},
				"status": {
					"type": "string",
					"description": "初始状态",
					"enum": [
						"todo",
						"in_progress",
						"done",
						"archived"
					]
				},
				"dueDate": {
					"type": "string",
					"description": "截止时间 YYYY-MM-DDTHH:mm（也兼容纯日期 YYYY-MM-DD）"
				},
				"assignee": {
					"type": "string",
					"description": "负责人"
				}
			},
			"required": ["title"]
		},
		"readOnly": false
	};
	setTaskStatus.__webmcpSchema = {
		"description": "切换任务状态（todo / in_progress / done / archived）",
		"inputSchema": {
			"type": "object",
			"properties": {
				"id": {
					"type": "string",
					"description": "任务 ID"
				},
				"status": {
					"type": "string",
					"description": "新状态",
					"enum": [
						"todo",
						"in_progress",
						"done",
						"archived"
					]
				}
			},
			"required": ["id", "status"]
		},
		"readOnly": false
	};
	openTaskCreator.__webmcpSchema = {
		"description": "[作用域：工作台页] 打开新建任务弹窗（让用户在弹窗里继续手动填写）。",
		"inputSchema": {
			"type": "object",
			"properties": {}
		},
		"readOnly": false
	};
	closeTaskDialog.__webmcpSchema = {
		"description": "[作用域：工作台页] 关闭当前打开的新建 / 编辑任务弹窗。",
		"inputSchema": {
			"type": "object",
			"properties": {}
		},
		"readOnly": false
	};
	useWebMcpTools({
		createTask,
		setTaskStatus,
		openTaskCreator,
		closeTaskDialog
	});
	const stats = (0, import_react.useMemo)(() => {
		const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
		return {
			total: tasks.length,
			todo: tasks.filter((t) => t.status === "todo").length,
			inProgress: tasks.filter((t) => t.status === "in_progress").length,
			done: tasks.filter((t) => t.status === "done").length,
			overdue: tasks.filter((t) => t.dueDate && t.dueDate < today && t.status !== "done" && t.status !== "archived").length
		};
	}, [tasks]);
	const dueSoon = (0, import_react.useMemo)(() => tasks.filter((t) => t.status !== "done" && t.status !== "archived" && t.dueDate).sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? "")).slice(0, 5), [tasks]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "page page--dashboard",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "page__head",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "page__eyebrow",
						children: "2026 · 05 · 21"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "page__title",
						children: "今天的工作台"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "page__subtitle",
						children: "把当下最值得做的事放在最前面，剩下的交给 WebMCP 工具自动协作。"
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "primary-btn",
					onClick: () => setCreating(true),
					children: "+ 新建任务"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "stat-grid",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "任务总数",
						value: stats.total,
						accent: "#2f6f5e"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "待办",
						value: stats.todo,
						accent: "#64748b"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "进行中",
						value: stats.inProgress,
						accent: "#0ea5e9"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "已完成",
						value: stats.done,
						accent: "#16a34a"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "逾期",
						value: stats.overdue,
						accent: "#dc2626"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "dashboard__cols",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "dashboard__col",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "dashboard__col-head",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "即将到期" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "ghost-btn",
							onClick: () => navigate("/tasks"),
							children: "查看所有任务 →"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "task-grid",
						children: [dueSoon.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskCard, {
							task: t,
							onClick: setEditing
						}, t.id)), dueSoon.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "muted",
							children: "没有即将到期的任务，干得漂亮 ✦"
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "dashboard__col dashboard__col--side",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "dashboard__col-head",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "项目" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "ghost-btn",
							onClick: () => navigate("/projects"),
							children: "全部项目 →"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "project-pill-list",
						children: projects.map((p) => {
							const count = tasks.filter((t) => t.projectId === p.id).length;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "project-pill",
								onClick: () => navigate(`/projects/${p.id}`),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "dot",
										style: { background: p.color }
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "project-pill__name",
										children: p.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "project-pill__count",
										children: count
									})
								]
							}, p.id);
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskFormDialog, {
				open: creating || !!editing,
				editingTask: editing,
				onClose: () => {
					setCreating(false);
					setEditing(null);
				}
			})
		]
	});
}
function StatCard({ label, value, accent }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "stat-card",
		style: { borderLeftColor: accent },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "stat-card__value",
			children: value
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "stat-card__label",
			children: label
		})]
	});
}
//#endregion
//#region src/components/SearchBar.tsx
/**
* 搜索框组件 — 仅在它挂载的页面期间注册自身的工具。
*/
function SearchBar({ value, onChange, placeholder }) {
	/**
	* [作用域：搜索框组件] 设置当前搜索框的关键词并立即应用过滤。
	*/
	const setSearchQuery = (0, import_react.useCallback)(async (params) => {
		onChange(params.query);
		return { applied: params.query };
	}, [onChange]);
	/**
	* [作用域：搜索框组件] 清空当前搜索框。
	*/
	const clearSearchQuery = (0, import_react.useCallback)(async () => {
		onChange("");
		return { cleared: true };
	}, [onChange]);
	setSearchQuery.__webmcpSchema = {
		"description": "[作用域：搜索框组件] 设置当前搜索框的关键词并立即应用过滤。",
		"inputSchema": {
			"type": "object",
			"properties": { "query": {
				"type": "string",
				"description": "搜索关键词"
			} },
			"required": ["query"]
		},
		"readOnly": false
	};
	clearSearchQuery.__webmcpSchema = {
		"description": "[作用域：搜索框组件] 清空当前搜索框。",
		"inputSchema": {
			"type": "object",
			"properties": {}
		},
		"readOnly": false
	};
	useWebMcpTools({
		setSearchQuery,
		clearSearchQuery
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "search-bar",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "search-bar__icon",
				children: "⌕"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "search",
				className: "search-bar__input",
				value,
				onChange: (e) => onChange(e.target.value),
				placeholder: placeholder ?? "搜索任务标题或描述…",
				"aria-label": "搜索"
			}),
			value && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "search-bar__clear",
				onClick: () => onChange(""),
				"aria-label": "清空搜索",
				children: "×"
			})
		]
	});
}
//#endregion
//#region src/components/FilterPanel.tsx
var ALL_PRIORITIES = [
	"urgent",
	"high",
	"medium",
	"low"
];
var ALL_STATUSES = [
	"todo",
	"in_progress",
	"done",
	"archived"
];
/**
* 多条件过滤面板 — 仅在它挂载的页面期间注册自身的工具。
*/
function FilterPanel({ filters, onChange }) {
	const { projects, tags } = useTodoStore();
	const set = (0, import_react.useCallback)((patch) => onChange({
		...filters,
		...patch
	}), [filters, onChange]);
	const togglePriority = (p) => {
		set({ priorities: filters.priorities.includes(p) ? filters.priorities.filter((x) => x !== p) : [...filters.priorities, p] });
	};
	const toggleStatus = (s) => {
		set({ statuses: filters.statuses.includes(s) ? filters.statuses.filter((x) => x !== s) : [...filters.statuses, s] });
	};
	const toggleTag = (id) => {
		set({ tagIds: filters.tagIds.includes(id) ? filters.tagIds.filter((x) => x !== id) : [...filters.tagIds, id] });
	};
	/**
	* [作用域：过滤面板组件] 批量应用过滤条件（已设字段会覆盖，未设字段保持当前）。
	*/
	const applyFilters = (0, import_react.useCallback)(async (params) => {
		const patch = {};
		if (params.projectId !== void 0) patch.projectId = params.projectId;
		if (params.tagIds !== void 0) patch.tagIds = params.tagIds;
		if (params.priorities !== void 0) patch.priorities = params.priorities;
		if (params.statuses !== void 0) patch.statuses = params.statuses;
		if (params.assignee !== void 0) patch.assignee = params.assignee;
		if (params.dueFrom !== void 0) patch.dueFrom = params.dueFrom;
		if (params.dueTo !== void 0) patch.dueTo = params.dueTo;
		onChange({
			...filters,
			...patch
		});
		return { applied: true };
	}, [filters, onChange]);
	/**
	* [作用域：过滤面板组件] 重置过滤面板为初始状态（保留搜索关键词）。
	*/
	const resetFilters = (0, import_react.useCallback)(async () => {
		onChange({
			...EMPTY_FILTERS,
			search: filters.search
		});
		return { reset: true };
	}, [filters.search, onChange]);
	applyFilters.__webmcpSchema = {
		"description": "[作用域：过滤面板组件] 批量应用过滤条件（已设字段会覆盖，未设字段保持当前）。",
		"inputSchema": {
			"type": "object",
			"properties": {
				"projectId": {
					"type": "string",
					"description": "项目 ID（传 null 清除）"
				},
				"tagIds": {
					"type": "array",
					"description": "标签 ID 列表（整体替换）"
				},
				"priorities": {
					"type": "array",
					"description": "优先级列表"
				},
				"statuses": {
					"type": "array",
					"description": "状态列表"
				},
				"assignee": {
					"type": "string",
					"description": "负责人（传 null 清除）"
				},
				"dueFrom": {
					"type": "string",
					"description": "截止日期起 YYYY-MM-DD"
				},
				"dueTo": {
					"type": "string",
					"description": "截止日期止 YYYY-MM-DD"
				}
			}
		},
		"readOnly": false
	};
	resetFilters.__webmcpSchema = {
		"description": "[作用域：过滤面板组件] 重置过滤面板为初始状态（保留搜索关键词）。",
		"inputSchema": {
			"type": "object",
			"properties": {}
		},
		"readOnly": false
	};
	useWebMcpTools({
		applyFilters,
		resetFilters
	});
	const assignees = Array.from(new Set(useTodoStore().tasks.map((t) => t.assignee)));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "filter-panel",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "filter-panel__head",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { children: "过滤" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "ghost-btn",
					onClick: () => onChange({
						...EMPTY_FILTERS,
						search: filters.search
					}),
					children: "重置"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "filter-panel__group",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "项目" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					value: filters.projectId ?? "",
					onChange: (e) => set({ projectId: e.target.value || null }),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: "全部项目"
					}), projects.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: p.id,
						children: p.name
					}, p.id))]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "filter-panel__group",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "优先级" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "chip-row",
					children: ALL_PRIORITIES.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: `chip ${filters.priorities.includes(p) ? "is-active" : ""}`,
						onClick: () => togglePriority(p),
						children: PRIORITY_LABEL[p]
					}, p))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "filter-panel__group",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "状态" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "chip-row",
					children: ALL_STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: `chip ${filters.statuses.includes(s) ? "is-active" : ""}`,
						onClick: () => toggleStatus(s),
						children: STATUS_LABEL[s]
					}, s))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "filter-panel__group",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "标签" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "chip-row",
					children: tags.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: `chip ${filters.tagIds.includes(t.id) ? "is-active" : ""}`,
						style: filters.tagIds.includes(t.id) ? {
							borderColor: t.color,
							color: t.color
						} : void 0,
						onClick: () => toggleTag(t.id),
						children: ["#", t.name]
					}, t.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "filter-panel__group",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "负责人" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					value: filters.assignee ?? "",
					onChange: (e) => set({ assignee: e.target.value || null }),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: "全部成员"
					}), assignees.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: a,
						children: a
					}, a))]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "filter-panel__group",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "截止日期范围" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "filter-panel__range",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "filter-panel__range-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "filter-panel__range-tag",
							children: "起"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "date",
							value: filters.dueFrom ?? "",
							onChange: (e) => set({ dueFrom: e.target.value || null }),
							"aria-label": "起始日期"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "filter-panel__range-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "filter-panel__range-tag",
							children: "止"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "date",
							value: filters.dueTo ?? "",
							onChange: (e) => set({ dueTo: e.target.value || null }),
							"aria-label": "结束日期"
						})]
					})]
				})]
			})
		]
	});
}
//#endregion
//#region src/pages/TasksPage.tsx
var SORT_FIELDS = [
	"default",
	"priority",
	"createdAt",
	"dueDate",
	"title"
];
var SORT_FIELD_SHORT = {
	default: "默认",
	priority: "优先级",
	createdAt: "创建时间",
	dueDate: "截止时间",
	title: "标题"
};
function sortTasks(tasks, sort) {
	if (sort.field === "default") return tasks;
	const dir = sort.direction === "desc" ? -1 : 1;
	const cmp = (a, b) => {
		switch (sort.field) {
			case "priority": return (PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]) * dir;
			case "createdAt": return a.createdAt.localeCompare(b.createdAt) * dir;
			case "dueDate": {
				const ad = a.dueDate ?? "￿";
				const bd = b.dueDate ?? "￿";
				return ad.localeCompare(bd) * dir;
			}
			case "title": return a.title.localeCompare(b.title, "zh-Hans-CN") * dir;
			default: return 0;
		}
	};
	return [...tasks].sort(cmp);
}
function TasksPage() {
	const { filterTasks, createTask, updateTask, deleteTask, deleteTasks, setTaskStatus, bulkSetTaskStatus, setTaskPriority, setTaskDueDate, setTaskAssignee, moveTaskToProject, addTaskTag, removeTaskTag } = useTodoStore();
	const [filters, setFilters] = (0, import_react.useState)(EMPTY_FILTERS);
	const [sort, setSort] = (0, import_react.useState)(DEFAULT_SORT);
	const [creating, setCreating] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const tasks = (0, import_react.useMemo)(() => sortTasks(filterTasks(filters), sort), [
		filterTasks,
		filters,
		sort
	]);
	/**
	* [作用域：任务列表页] 打开「新建任务」弹窗（让用户在弹窗里手动填写并提交）。
	*/
	const openTaskCreator = (0, import_react.useCallback)(async () => {
		setCreating(true);
		return { opened: true };
	}, []);
	/**
	* [作用域：任务列表页] 关闭当前打开的新建 / 编辑任务弹窗。
	*/
	const closeTaskDialog = (0, import_react.useCallback)(async () => {
		setCreating(false);
		setEditing(null);
		return { closed: true };
	}, []);
	/**
	* [作用域：任务列表页] 设置任务列表的排序规则（字段 + 升降序）。default = 优先级+截止时间。
	*/
	const setTaskSort = (0, import_react.useCallback)(async (params) => {
		const next = {
			field: params.field,
			direction: params.direction ?? "asc"
		};
		setSort(next);
		return { applied: next };
	}, []);
	/**
	* [作用域：任务列表页] 重置任务列表排序为默认（优先级 + 截止时间）。
	*/
	const resetTaskSort = (0, import_react.useCallback)(async () => {
		setSort(DEFAULT_SORT);
		return { reset: true };
	}, []);
	createTask.__webmcpSchema = {
		"description": "新建任务（写入全局任务列表）",
		"inputSchema": {
			"type": "object",
			"properties": {
				"title": {
					"type": "string",
					"description": "任务标题"
				},
				"description": {
					"type": "string",
					"description": "任务描述"
				},
				"projectId": {
					"type": "string",
					"description": "所属项目 ID（默认 p_inbox 收件箱）"
				},
				"tagIds": {
					"type": "array",
					"description": "标签 ID 列表"
				},
				"priority": {
					"type": "string",
					"description": "优先级",
					"enum": [
						"low",
						"medium",
						"high",
						"urgent"
					]
				},
				"status": {
					"type": "string",
					"description": "初始状态",
					"enum": [
						"todo",
						"in_progress",
						"done",
						"archived"
					]
				},
				"dueDate": {
					"type": "string",
					"description": "截止时间 YYYY-MM-DDTHH:mm（也兼容纯日期 YYYY-MM-DD）"
				},
				"assignee": {
					"type": "string",
					"description": "负责人"
				}
			},
			"required": ["title"]
		},
		"readOnly": false
	};
	updateTask.__webmcpSchema = {
		"description": "部分更新一条任务的字段",
		"inputSchema": {
			"type": "object",
			"properties": {
				"id": {
					"type": "string",
					"description": "任务 ID"
				},
				"title": {
					"type": "string",
					"description": "新标题"
				},
				"description": {
					"type": "string",
					"description": "新描述"
				},
				"projectId": {
					"type": "string",
					"description": "新所属项目 ID"
				},
				"priority": {
					"type": "string",
					"description": "新优先级",
					"enum": [
						"low",
						"medium",
						"high",
						"urgent"
					]
				},
				"status": {
					"type": "string",
					"description": "新状态",
					"enum": [
						"todo",
						"in_progress",
						"done",
						"archived"
					]
				},
				"dueDate": {
					"type": "string",
					"description": "新截止时间 YYYY-MM-DDTHH:mm（或纯日期 YYYY-MM-DD），传 null 清除"
				},
				"assignee": {
					"type": "string",
					"description": "新负责人"
				},
				"tagIds": {
					"type": "array",
					"description": "标签 ID 列表（整体替换）"
				}
			},
			"required": ["id"]
		},
		"readOnly": false
	};
	deleteTask.__webmcpSchema = {
		"description": "删除一条任务",
		"inputSchema": {
			"type": "object",
			"properties": { "id": {
				"type": "string",
				"description": "任务 ID"
			} },
			"required": ["id"]
		},
		"readOnly": false
	};
	deleteTasks.__webmcpSchema = {
		"description": "批量删除任务（一次传多个 ID）",
		"inputSchema": {
			"type": "object",
			"properties": { "ids": {
				"type": "array",
				"description": "任务 ID 列表",
				"items": { "type": "string" }
			} },
			"required": ["ids"]
		},
		"readOnly": false
	};
	setTaskStatus.__webmcpSchema = {
		"description": "切换任务状态（todo / in_progress / done / archived）",
		"inputSchema": {
			"type": "object",
			"properties": {
				"id": {
					"type": "string",
					"description": "任务 ID"
				},
				"status": {
					"type": "string",
					"description": "新状态",
					"enum": [
						"todo",
						"in_progress",
						"done",
						"archived"
					]
				}
			},
			"required": ["id", "status"]
		},
		"readOnly": false
	};
	bulkSetTaskStatus.__webmcpSchema = {
		"description": "批量切换任务状态",
		"inputSchema": {
			"type": "object",
			"properties": {
				"ids": {
					"type": "array",
					"description": "任务 ID 列表",
					"items": { "type": "string" }
				},
				"status": {
					"type": "string",
					"description": "新状态",
					"enum": [
						"todo",
						"in_progress",
						"done",
						"archived"
					]
				}
			},
			"required": ["ids", "status"]
		},
		"readOnly": false
	};
	setTaskPriority.__webmcpSchema = {
		"description": "设置任务优先级",
		"inputSchema": {
			"type": "object",
			"properties": {
				"id": {
					"type": "string",
					"description": "任务 ID"
				},
				"priority": {
					"type": "string",
					"description": "新优先级",
					"enum": [
						"low",
						"medium",
						"high",
						"urgent"
					]
				}
			},
			"required": ["id", "priority"]
		},
		"readOnly": false
	};
	setTaskDueDate.__webmcpSchema = {
		"description": "设置任务截止时间，传 null 清除",
		"inputSchema": {
			"type": "object",
			"properties": {
				"id": {
					"type": "string",
					"description": "任务 ID"
				},
				"dueDate": {
					"type": "string",
					"description": "截止时间 YYYY-MM-DDTHH:mm（或纯日期 YYYY-MM-DD），或 null 清除"
				}
			},
			"required": ["id", "dueDate"]
		},
		"readOnly": false
	};
	setTaskAssignee.__webmcpSchema = {
		"description": "设置任务负责人",
		"inputSchema": {
			"type": "object",
			"properties": {
				"id": {
					"type": "string",
					"description": "任务 ID"
				},
				"assignee": {
					"type": "string",
					"description": "负责人名称"
				}
			},
			"required": ["id", "assignee"]
		},
		"readOnly": false
	};
	moveTaskToProject.__webmcpSchema = {
		"description": "把任务移动到另一个项目",
		"inputSchema": {
			"type": "object",
			"properties": {
				"id": {
					"type": "string",
					"description": "任务 ID"
				},
				"projectId": {
					"type": "string",
					"description": "目标项目 ID"
				}
			},
			"required": ["id", "projectId"]
		},
		"readOnly": false
	};
	addTaskTag.__webmcpSchema = {
		"description": "给任务追加一个标签（已有则忽略）",
		"inputSchema": {
			"type": "object",
			"properties": {
				"taskId": {
					"type": "string",
					"description": "任务 ID"
				},
				"tagId": {
					"type": "string",
					"description": "标签 ID"
				}
			},
			"required": ["taskId", "tagId"]
		},
		"readOnly": false
	};
	removeTaskTag.__webmcpSchema = {
		"description": "从任务移除一个标签",
		"inputSchema": {
			"type": "object",
			"properties": {
				"taskId": {
					"type": "string",
					"description": "任务 ID"
				},
				"tagId": {
					"type": "string",
					"description": "标签 ID"
				}
			},
			"required": ["taskId", "tagId"]
		},
		"readOnly": false
	};
	openTaskCreator.__webmcpSchema = {
		"description": "[作用域：任务列表页] 打开「新建任务」弹窗（让用户在弹窗里手动填写并提交）。",
		"inputSchema": {
			"type": "object",
			"properties": {}
		},
		"readOnly": false
	};
	closeTaskDialog.__webmcpSchema = {
		"description": "[作用域：任务列表页] 关闭当前打开的新建 / 编辑任务弹窗。",
		"inputSchema": {
			"type": "object",
			"properties": {}
		},
		"readOnly": false
	};
	setTaskSort.__webmcpSchema = {
		"description": "[作用域：任务列表页] 设置任务列表的排序规则（字段 + 升降序）。default = 优先级+截止时间。",
		"inputSchema": {
			"type": "object",
			"properties": {
				"field": {
					"type": "string",
					"description": "排序字段：default(默认) / priority / createdAt / dueDate / title",
					"enum": [
						"default",
						"priority",
						"createdAt",
						"dueDate",
						"title"
					]
				},
				"direction": {
					"type": "string",
					"description": "排序方向：asc 升序 / desc 降序（默认 asc）",
					"enum": ["asc", "desc"]
				}
			},
			"required": ["field"]
		},
		"readOnly": false
	};
	resetTaskSort.__webmcpSchema = {
		"description": "[作用域：任务列表页] 重置任务列表排序为默认（优先级 + 截止时间）。",
		"inputSchema": {
			"type": "object",
			"properties": {}
		},
		"readOnly": false
	};
	useWebMcpTools({
		createTask,
		updateTask,
		deleteTask,
		deleteTasks,
		setTaskStatus,
		bulkSetTaskStatus,
		setTaskPriority,
		setTaskDueDate,
		setTaskAssignee,
		moveTaskToProject,
		addTaskTag,
		removeTaskTag,
		openTaskCreator,
		closeTaskDialog,
		setTaskSort,
		resetTaskSort
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "page page--tasks",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "page__head",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "page__eyebrow",
						children: "任务"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "page__title",
						children: "所有任务"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "page__subtitle",
						children: [
							"搜索 + 多条件过滤；当前命中 ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: tasks.length }),
							" 条。"
						]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "primary-btn",
					onClick: () => setCreating(true),
					children: "+ 新建任务"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "tasks-layout",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "tasks-layout__main",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchBar, {
							value: filters.search,
							onChange: (search) => setFilters((prev) => ({
								...prev,
								search
							}))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "tasks-sort-row",
							role: "group",
							"aria-label": "任务排序",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tasks-sort-row__label",
									children: "排序"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "sort-chips",
									children: SORT_FIELDS.map((f) => {
										const isActive = sort.field === f;
										const isDefault = f === "default";
										const handleClick = () => {
											if (!isActive) setSort({
												field: f,
												direction: "asc"
											});
											else if (!isDefault) setSort((s) => ({
												...s,
												direction: s.direction === "asc" ? "desc" : "asc"
											}));
										};
										const title = isActive ? isDefault ? "当前为默认排序（优先级 + 截止时间）" : `按${SORT_FIELD_SHORT[f]}排序，点击切换升降序（当前${sort.direction === "asc" ? "升序" : "降序"}）` : `按${SORT_FIELD_SHORT[f]}排序`;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											className: `sort-chip ${isActive ? "is-active" : ""} ${isDefault ? "sort-chip--default" : ""}`,
											onClick: handleClick,
											"aria-pressed": isActive,
											title,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: SORT_FIELD_SHORT[f] }), isActive && !isDefault && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "sort-chip__dir",
												"aria-hidden": "true",
												children: sort.direction === "asc" ? "↑" : "↓"
											})]
										}, f);
									})
								}),
								sort.field !== "default" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "link-btn tasks-sort-row__reset",
									onClick: () => setSort(DEFAULT_SORT),
									children: "还原默认"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "task-grid task-grid--list",
							children: [tasks.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskCard, {
								task: t,
								onClick: setEditing
							}, t.id)), tasks.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "muted",
								children: [
									"没有匹配的任务。换一组过滤条件，或者直接 ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: "新建" }),
									" 一条。"
								]
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterPanel, {
					filters,
					onChange: setFilters
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskFormDialog, {
				open: creating || !!editing,
				editingTask: editing,
				onClose: () => {
					setCreating(false);
					setEditing(null);
				}
			})
		]
	});
}
//#endregion
//#region src/pages/ProjectsPage.tsx
function ProjectsPage() {
	const { projects, tasks, createProject, updateProject, deleteProject } = useTodoStore();
	const navigate = useNavigate();
	const [name, setName] = (0, import_react.useState)("");
	const [description, setDescription] = (0, import_react.useState)("");
	const [color, setColor] = (0, import_react.useState)("#2f6f5e");
	/**
	* [作用域：项目列表页] 跳转到指定项目的详情页。
	*/
	const openProject = (0, import_react.useCallback)(async (params) => {
		navigate(`/projects/${params.projectId}`);
		return { navigated: params.projectId };
	}, [navigate]);
	createProject.__webmcpSchema = {
		"description": "新建一个项目",
		"inputSchema": {
			"type": "object",
			"properties": {
				"name": {
					"type": "string",
					"description": "项目名称"
				},
				"description": {
					"type": "string",
					"description": "项目描述"
				},
				"color": {
					"type": "string",
					"description": "项目代表色 (#rrggbb)"
				}
			},
			"required": ["name"]
		},
		"readOnly": false
	};
	updateProject.__webmcpSchema = {
		"description": "修改项目（名称 / 描述 / 颜色，部分更新）",
		"inputSchema": {
			"type": "object",
			"properties": {
				"id": {
					"type": "string",
					"description": "项目 ID"
				},
				"name": {
					"type": "string",
					"description": "新名称"
				},
				"description": {
					"type": "string",
					"description": "新描述"
				},
				"color": {
					"type": "string",
					"description": "新颜色 (#rrggbb)"
				}
			},
			"required": ["id"]
		},
		"readOnly": false
	};
	deleteProject.__webmcpSchema = {
		"description": "删除项目（p_inbox 不可删；原任务会被移回收件箱）",
		"inputSchema": {
			"type": "object",
			"properties": { "id": {
				"type": "string",
				"description": "项目 ID"
			} },
			"required": ["id"]
		},
		"readOnly": false
	};
	openProject.__webmcpSchema = {
		"description": "[作用域：项目列表页] 跳转到指定项目的详情页。",
		"inputSchema": {
			"type": "object",
			"properties": { "projectId": {
				"type": "string",
				"description": "项目 ID"
			} },
			"required": ["projectId"]
		},
		"readOnly": false
	};
	useWebMcpTools({
		createProject,
		updateProject,
		deleteProject,
		openProject
	});
	const submit = (e) => {
		e.preventDefault();
		if (!name.trim()) return;
		createProject({
			name,
			description,
			color
		});
		setName("");
		setDescription("");
		setColor("#2f6f5e");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "page page--projects",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "page__head",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "page__eyebrow",
						children: "项目"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "page__title",
						children: "项目管理"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "page__subtitle",
						children: [
							"点击任一项目卡片进入详情；当前共 ",
							projects.length,
							" 个项目。"
						]
					})
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "project-grid",
				children: projects.map((p) => {
					const ts = tasks.filter((t) => t.projectId === p.id);
					const done = ts.filter((t) => t.status === "done").length;
					const pct = ts.length === 0 ? 0 : Math.round(done / ts.length * 100);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "project-card",
						onClick: () => navigate(`/projects/${p.id}`),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "project-card__head",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "dot dot--lg",
										style: { background: p.color }
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: p.name }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyableId, {
										id: p.id,
										label: "Project ID"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "project-card__desc",
								children: p.description
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "project-card__bar",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "project-card__bar-fill",
									style: {
										width: `${pct}%`,
										background: p.color
									}
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "project-card__meta",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [ts.length, " 个任务"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [pct, "% 完成"] })]
							})
						]
					}, p.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "inline-form",
				onSubmit: submit,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "新建项目" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "field-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "field",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "名称" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: name,
								onChange: (e) => setName(e.target.value),
								required: true
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "field",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "颜色" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "color",
								value: color,
								onChange: (e) => setColor(e.target.value)
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "field",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "描述" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: description,
							onChange: (e) => setDescription(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						className: "primary-btn",
						children: "创建项目"
					})
				]
			})
		]
	});
}
//#endregion
//#region src/pages/ProjectDetailPage.tsx
function ProjectDetailPage() {
	const { projectId } = useParams();
	const navigate = useNavigate();
	const { projects, tasks, createTask, updateTask, deleteTask, setTaskStatus, updateProject, deleteProject } = useTodoStore();
	const project = projects.find((p) => p.id === projectId);
	const [creating, setCreating] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	/**
	* [作用域：项目详情页] 在当前项目下打开「新建任务」弹窗。
	*/
	const openTaskCreator = (0, import_react.useCallback)(async () => {
		setCreating(true);
		return { opened: true };
	}, []);
	/**
	* [作用域：项目详情页] 关闭当前打开的新建 / 编辑任务弹窗。
	*/
	const closeTaskDialog = (0, import_react.useCallback)(async () => {
		setCreating(false);
		setEditing(null);
		return { closed: true };
	}, []);
	/**
	* [作用域：项目详情页] 返回到项目列表页。
	*/
	const backToProjects = (0, import_react.useCallback)(async () => {
		navigate("/projects");
		return { navigated: "/projects" };
	}, [navigate]);
	createTask.__webmcpSchema = {
		"description": "新建任务（写入全局任务列表）",
		"inputSchema": {
			"type": "object",
			"properties": {
				"title": {
					"type": "string",
					"description": "任务标题"
				},
				"description": {
					"type": "string",
					"description": "任务描述"
				},
				"projectId": {
					"type": "string",
					"description": "所属项目 ID（默认 p_inbox 收件箱）"
				},
				"tagIds": {
					"type": "array",
					"description": "标签 ID 列表"
				},
				"priority": {
					"type": "string",
					"description": "优先级",
					"enum": [
						"low",
						"medium",
						"high",
						"urgent"
					]
				},
				"status": {
					"type": "string",
					"description": "初始状态",
					"enum": [
						"todo",
						"in_progress",
						"done",
						"archived"
					]
				},
				"dueDate": {
					"type": "string",
					"description": "截止时间 YYYY-MM-DDTHH:mm（也兼容纯日期 YYYY-MM-DD）"
				},
				"assignee": {
					"type": "string",
					"description": "负责人"
				}
			},
			"required": ["title"]
		},
		"readOnly": false
	};
	updateTask.__webmcpSchema = {
		"description": "部分更新一条任务的字段",
		"inputSchema": {
			"type": "object",
			"properties": {
				"id": {
					"type": "string",
					"description": "任务 ID"
				},
				"title": {
					"type": "string",
					"description": "新标题"
				},
				"description": {
					"type": "string",
					"description": "新描述"
				},
				"projectId": {
					"type": "string",
					"description": "新所属项目 ID"
				},
				"priority": {
					"type": "string",
					"description": "新优先级",
					"enum": [
						"low",
						"medium",
						"high",
						"urgent"
					]
				},
				"status": {
					"type": "string",
					"description": "新状态",
					"enum": [
						"todo",
						"in_progress",
						"done",
						"archived"
					]
				},
				"dueDate": {
					"type": "string",
					"description": "新截止时间 YYYY-MM-DDTHH:mm（或纯日期 YYYY-MM-DD），传 null 清除"
				},
				"assignee": {
					"type": "string",
					"description": "新负责人"
				},
				"tagIds": {
					"type": "array",
					"description": "标签 ID 列表（整体替换）"
				}
			},
			"required": ["id"]
		},
		"readOnly": false
	};
	deleteTask.__webmcpSchema = {
		"description": "删除一条任务",
		"inputSchema": {
			"type": "object",
			"properties": { "id": {
				"type": "string",
				"description": "任务 ID"
			} },
			"required": ["id"]
		},
		"readOnly": false
	};
	setTaskStatus.__webmcpSchema = {
		"description": "切换任务状态（todo / in_progress / done / archived）",
		"inputSchema": {
			"type": "object",
			"properties": {
				"id": {
					"type": "string",
					"description": "任务 ID"
				},
				"status": {
					"type": "string",
					"description": "新状态",
					"enum": [
						"todo",
						"in_progress",
						"done",
						"archived"
					]
				}
			},
			"required": ["id", "status"]
		},
		"readOnly": false
	};
	updateProject.__webmcpSchema = {
		"description": "修改项目（名称 / 描述 / 颜色，部分更新）",
		"inputSchema": {
			"type": "object",
			"properties": {
				"id": {
					"type": "string",
					"description": "项目 ID"
				},
				"name": {
					"type": "string",
					"description": "新名称"
				},
				"description": {
					"type": "string",
					"description": "新描述"
				},
				"color": {
					"type": "string",
					"description": "新颜色 (#rrggbb)"
				}
			},
			"required": ["id"]
		},
		"readOnly": false
	};
	deleteProject.__webmcpSchema = {
		"description": "删除项目（p_inbox 不可删；原任务会被移回收件箱）",
		"inputSchema": {
			"type": "object",
			"properties": { "id": {
				"type": "string",
				"description": "项目 ID"
			} },
			"required": ["id"]
		},
		"readOnly": false
	};
	openTaskCreator.__webmcpSchema = {
		"description": "[作用域：项目详情页] 在当前项目下打开「新建任务」弹窗。",
		"inputSchema": {
			"type": "object",
			"properties": {}
		},
		"readOnly": false
	};
	closeTaskDialog.__webmcpSchema = {
		"description": "[作用域：项目详情页] 关闭当前打开的新建 / 编辑任务弹窗。",
		"inputSchema": {
			"type": "object",
			"properties": {}
		},
		"readOnly": false
	};
	backToProjects.__webmcpSchema = {
		"description": "[作用域：项目详情页] 返回到项目列表页。",
		"inputSchema": {
			"type": "object",
			"properties": {}
		},
		"readOnly": false
	};
	useWebMcpTools({
		createTask,
		updateTask,
		deleteTask,
		setTaskStatus,
		updateProject,
		deleteProject,
		openTaskCreator,
		closeTaskDialog,
		backToProjects
	});
	if (!project) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "page",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "项目不存在" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			className: "primary-btn",
			onClick: () => navigate("/projects"),
			children: "回到项目列表"
		})]
	});
	const projectTasks = tasks.filter((t) => t.projectId === project.id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "page page--project-detail",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "page__head",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "page__eyebrow",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "link-btn",
							onClick: () => navigate("/projects"),
							children: "← 项目"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "page__title",
						style: { color: project.color },
						children: project.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "page__subtitle",
						children: project.description
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "primary-btn",
					onClick: () => setCreating(true),
					children: "+ 新建任务"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "task-grid task-grid--list",
				children: [projectTasks.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskCard, {
					task: t,
					onClick: setEditing
				}, t.id)), projectTasks.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "muted",
					children: "这个项目暂时没有任务。"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskFormDialog, {
				open: creating || !!editing,
				initialProjectId: project.id,
				editingTask: editing,
				onClose: () => {
					setCreating(false);
					setEditing(null);
				}
			})
		]
	});
}
//#endregion
//#region src/pages/TagsPage.tsx
function TagsPage() {
	const { tags, tasks, createTag, updateTag, deleteTag } = useTodoStore();
	const [name, setName] = (0, import_react.useState)("");
	const [color, setColor] = (0, import_react.useState)("#7c3aed");
	createTag.__webmcpSchema = {
		"description": "新建一个标签",
		"inputSchema": {
			"type": "object",
			"properties": {
				"name": {
					"type": "string",
					"description": "标签名"
				},
				"color": {
					"type": "string",
					"description": "标签颜色 (#rrggbb)"
				}
			},
			"required": ["name"]
		},
		"readOnly": false
	};
	updateTag.__webmcpSchema = {
		"description": "修改标签（名称 / 颜色，部分更新）",
		"inputSchema": {
			"type": "object",
			"properties": {
				"id": {
					"type": "string",
					"description": "标签 ID"
				},
				"name": {
					"type": "string",
					"description": "新名称"
				},
				"color": {
					"type": "string",
					"description": "新颜色 (#rrggbb)"
				}
			},
			"required": ["id"]
		},
		"readOnly": false
	};
	deleteTag.__webmcpSchema = {
		"description": "删除一个标签（同时从所有任务上移除该标签引用）",
		"inputSchema": {
			"type": "object",
			"properties": { "id": {
				"type": "string",
				"description": "标签 ID"
			} },
			"required": ["id"]
		},
		"readOnly": false
	};
	useWebMcpTools({
		createTag,
		updateTag,
		deleteTag
	});
	const submit = (e) => {
		e.preventDefault();
		if (!name.trim()) return;
		createTag({
			name,
			color
		});
		setName("");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "page page--tags",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "page__head",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "page__eyebrow",
						children: "标签"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "page__title",
						children: "标签系统"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "page__subtitle",
						children: "用标签贯穿不同项目，便于横向切分任务。"
					})
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "tag-list",
				children: tags.map((t) => {
					const count = tasks.filter((x) => x.tagIds.includes(t.id)).length;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "tag-list__item",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								color: t.color,
								tone: "soft",
								children: ["#", t.name]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyableId, {
								id: t.id,
								label: "Tag ID"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "tag-list__count",
								children: [count, " 个任务"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "ghost-btn",
								onClick: () => deleteTag({ id: t.id }),
								children: "删除"
							})
						]
					}, t.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "inline-form",
				onSubmit: submit,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "新建标签" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "field-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "field",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "标签名" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: name,
								onChange: (e) => setName(e.target.value),
								required: true
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "field",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "颜色" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "color",
								value: color,
								onChange: (e) => setColor(e.target.value)
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						className: "primary-btn",
						children: "创建标签"
					})
				]
			})
		]
	});
}
//#endregion
//#region src/App.tsx
function NavigateBridge() {
	const navigate = useNavigate();
	(0, import_react.useEffect)(() => {
		publishNavigate(navigate);
		return () => publishNavigate(null);
	}, [navigate]);
	return null;
}
function Shell() {
	const [debugOpen, setDebugOpen] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "\\") {
				e.preventDefault();
				setDebugOpen((v) => !v);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `app-shell ${debugOpen ? "shell--debug-open" : ""}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "sidebar",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "sidebar__brand",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "brand__mark",
							children: "◐"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "brand__name",
							children: "Nexus Todo"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
						className: "sidebar__nav",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(NavLink, {
								to: "/",
								end: true,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "nav__icon",
									children: "◇"
								}), " 概览"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(NavLink, {
								to: "/tasks",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "nav__icon",
									children: "▤"
								}), " 任务"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(NavLink, {
								to: "/projects",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "nav__icon",
									children: "⊞"
								}), " 项目"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(NavLink, {
								to: "/tags",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "nav__icon",
									children: "⌗"
								}), " 标签"]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "sidebar__hint",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", { children: "⌘" }),
							" + ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", { children: "\\" }),
							" 切换调试面板"
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "main",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavigateBridge, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Routes, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
						path: "/",
						element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardPage, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
						path: "/tasks",
						element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TasksPage, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
						path: "/projects",
						element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectsPage, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
						path: "/projects/:projectId",
						element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectDetailPage, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, {
						path: "/tags",
						element: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagsPage, {})
					})
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DebugPanel, {
				open: debugOpen,
				onToggle: () => setDebugOpen((v) => !v)
			})
		]
	});
}
function App() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TodoStoreProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrowserRouter, {
		basename: "/webmcp-nexus/".replace(/\/$/, "") || "/",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, {})
	}) });
}
//#endregion
//#region src/main.tsx
listTasks.__webmcpSchema = {
	"description": "[作用域：全局] 列出全部任务（不过滤，可指定数量上限）。",
	"inputSchema": {
		"type": "object",
		"properties": { "limit": {
			"type": "number",
			"description": "返回数量上限（默认 200）"
		} }
	},
	"readOnly": true
};
getTask.__webmcpSchema = {
	"description": "[作用域：全局] 根据 ID 读取单条任务详情。",
	"inputSchema": {
		"type": "object",
		"properties": { "id": {
			"type": "string",
			"description": "任务 ID"
		} },
		"required": ["id"]
	},
	"readOnly": true
};
searchTasks.__webmcpSchema = {
	"description": "[作用域：全局] 跨页面搜索任务（关键词匹配标题与描述，可叠加项目/标签/优先级/状态/负责人/截止日期范围等过滤）。",
	"inputSchema": {
		"type": "object",
		"properties": {
			"query": {
				"type": "string",
				"description": "关键词（匹配标题与描述）"
			},
			"projectId": {
				"type": "string",
				"description": "项目 ID 过滤"
			},
			"tagIds": {
				"type": "array",
				"description": "标签 ID 列表过滤（必须全部包含）"
			},
			"priorities": {
				"type": "array",
				"description": "优先级过滤"
			},
			"statuses": {
				"type": "array",
				"description": "状态过滤"
			},
			"assignee": {
				"type": "string",
				"description": "负责人过滤"
			},
			"dueFrom": {
				"type": "string",
				"description": "截止日期起 YYYY-MM-DD"
			},
			"dueTo": {
				"type": "string",
				"description": "截止日期止 YYYY-MM-DD"
			},
			"limit": {
				"type": "number",
				"description": "返回数量上限（默认 50）"
			}
		}
	},
	"readOnly": true
};
listProjects.__webmcpSchema = {
	"description": "[作用域：全局] 列出所有项目（含每个项目的任务数）。",
	"inputSchema": {
		"type": "object",
		"properties": {}
	},
	"readOnly": true
};
getProject.__webmcpSchema = {
	"description": "[作用域：全局] 读取单个项目详情（含任务数）。",
	"inputSchema": {
		"type": "object",
		"properties": { "id": {
			"type": "string",
			"description": "项目 ID"
		} },
		"required": ["id"]
	},
	"readOnly": true
};
listTags.__webmcpSchema = {
	"description": "[作用域：全局] 列出所有标签（含每个标签关联的任务数）。",
	"inputSchema": {
		"type": "object",
		"properties": {}
	},
	"readOnly": true
};
getTag.__webmcpSchema = {
	"description": "[作用域：全局] 读取单个标签详情（含任务数）。",
	"inputSchema": {
		"type": "object",
		"properties": { "id": {
			"type": "string",
			"description": "标签 ID"
		} },
		"required": ["id"]
	},
	"readOnly": true
};
listAssignees.__webmcpSchema = {
	"description": "[作用域：全局] 列出所有出现过的负责人（用于过滤、分配）。",
	"inputSchema": {
		"type": "object",
		"properties": {}
	},
	"readOnly": true
};
getStats.__webmcpSchema = {
	"description": "[作用域：全局] 读取当前应用的整体统计（任务总数 / 各状态数 / 逾期数）。",
	"inputSchema": {
		"type": "object",
		"properties": {}
	},
	"readOnly": true
};
navigate.__webmcpSchema = {
	"description": "[作用域：全局] 在应用内跳转路由（如 /tasks /projects /projects/:id /tags）。",
	"inputSchema": {
		"type": "object",
		"properties": { "to": {
			"type": "string",
			"description": "目标路径，例如 /tasks"
		} },
		"required": ["to"]
	},
	"readOnly": false
};
registerGlobalTools(queries_exports, navigation_exports);
(0, import_client.createRoot)(document.getElementById("root")).render(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.StrictMode, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(App, {}) }));
//#endregion
