# Generic Debounce

Debounce time is based on the function being passed. It is designed to be generic, allowing any function to be passed, including `Promise` functions, functions with a `return` value, or `void` type functions.

Function take in:

- `fn` : function that you want to run after debounce time
- `delay` : number in **ms**
- `callback` : another function callback -- that will handle any return from the other fn

### For example:

```tsx
const handleAddressDebounced = useGenericDebounce(
    (value: string) => getListAddresses(value),
    300,
    setAddressList,
);
```

The `fn` is `getListAddresses`

The `delay` is `300` ms

The `setAddressList` is the callback function that will call after we get the result of the `getListAddresses`