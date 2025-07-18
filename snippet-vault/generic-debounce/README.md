# Generic Debounce

Debounce time base on what function it is, make it so generic that we can pass in any function. That is include `Promise` function or function with `return` or just `avoid` type function.

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