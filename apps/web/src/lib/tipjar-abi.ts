export const TIPJAR_ABI = [
  {
    type: "event",
    name: "NewMemo",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "timestamp", type: "uint256", indexed: false },
      { name: "name", type: "string", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
      { name: "message", type: "string", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "function",
    stateMutability: "view",
    name: "getMemos",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "from", type: "address" },
          { name: "timestamp", type: "uint256" },
          { name: "name", type: "string" },
          { name: "amount", type: "uint256" },
          { name: "message", type: "string" },
        ],
      },
    ],
  },
  {
    type: "function",
    stateMutability: "payable",
    name: "tip",
    inputs: [
      { name: "_name", type: "string" },
      { name: "_message", type: "string" },
    ],
    outputs: [],
  },
] as const;

export const TIPJAR_ADDRESS = (process.env.NEXT_PUBLIC_TIPJAR_ADDRESS || "") as `0x${string}`;


