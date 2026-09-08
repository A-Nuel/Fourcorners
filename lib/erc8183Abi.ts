export const ERC8183_ESCROW_ABI = [
  {
    type: 'function',
    name: 'createJob',
    stateMutability: 'payable',
    inputs: [
      { name: 'provider', type: 'address' },
      { name: 'evaluator', type: 'address' },
      { name: 'durationSeconds', type: 'uint256' },
      { name: 'taskUri', type: 'string' }
    ],
    outputs: [{ name: 'jobId', type: 'uint256' }]
  },
  {
    type: 'function',
    name: 'fundJob',
    stateMutability: 'payable',
    inputs: [{ name: 'jobId', type: 'uint256' }],
    outputs: []
  },
  {
    type: 'function',
    name: 'submitJob',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'jobId', type: 'uint256' },
      { name: 'resultUri', type: 'string' }
    ],
    outputs: []
  },
  {
    type: 'function',
    name: 'completeJob',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'jobId', type: 'uint256' }],
    outputs: []
  },
  {
    type: 'function',
    name: 'refundJob',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'jobId', type: 'uint256' },
      { name: 'reason', type: 'string' }
    ],
    outputs: []
  },
  {
    type: 'function',
    name: 'getJob',
    stateMutability: 'view',
    inputs: [{ name: 'jobId', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'client', type: 'address' },
          { name: 'provider', type: 'address' },
          { name: 'evaluator', type: 'address' },
          { name: 'budget', type: 'uint256' },
          { name: 'status', type: 'uint8' },
          { name: 'createdAt', type: 'uint256' },
          { name: 'expiredAt', type: 'uint256' },
          { name: 'taskUri', type: 'string' },
          { name: 'resultUri', type: 'string' }
        ]
      }
    ]
  },
  {
    type: 'function',
    name: 'getClientJobs',
    stateMutability: 'view',
    inputs: [{ name: 'client', type: 'address' }],
    outputs: [{ name: '', type: 'uint256[]' }]
  },
  {
    type: 'function',
    name: 'getProviderJobs',
    stateMutability: 'view',
    inputs: [{ name: 'provider', type: 'address' }],
    outputs: [{ name: '', type: 'uint256[]' }]
  },
  {
    type: 'event',
    name: 'JobCreated',
    inputs: [
      { name: 'jobId', type: 'uint256', indexed: true },
      { name: 'client', type: 'address', indexed: true },
      { name: 'provider', type: 'address', indexed: true },
      { name: 'evaluator', type: 'address', indexed: false },
      { name: 'budget', type: 'uint256', indexed: false },
      { name: 'expiredAt', type: 'uint256', indexed: false },
      { name: 'taskUri', type: 'string', indexed: false }
    ]
  },
  {
    type: 'event',
    name: 'JobFunded',
    inputs: [
      { name: 'jobId', type: 'uint256', indexed: true },
      { name: 'client', type: 'address', indexed: true },
      { name: 'budget', type: 'uint256', indexed: false }
    ]
  },
  {
    type: 'event',
    name: 'JobSubmitted',
    inputs: [
      { name: 'jobId', type: 'uint256', indexed: true },
      { name: 'provider', type: 'address', indexed: true },
      { name: 'resultUri', type: 'string', indexed: false }
    ]
  },
  {
    type: 'event',
    name: 'JobCompleted',
    inputs: [
      { name: 'jobId', type: 'uint256', indexed: true },
      { name: 'provider', type: 'address', indexed: true },
      { name: 'payout', type: 'uint256', indexed: false }
    ]
  },
  {
    type: 'event',
    name: 'JobRefunded',
    inputs: [
      { name: 'jobId', type: 'uint256', indexed: true },
      { name: 'client', type: 'address', indexed: true },
      { name: 'refundAmount', type: 'uint256', indexed: false },
      { name: 'reason', type: 'string', indexed: false }
    ]
  }
] as const;

export const DEFAULT_ERC8183_ESCROW_ADDRESS = '0x8183000000000000000000000000000000000097' as `0x${string}`;
