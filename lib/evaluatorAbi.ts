export const TASK_EVALUATOR_ABI = [
  {
    type: 'function',
    name: 'evaluateTask',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'jobId', type: 'uint256' },
      { name: 'agent', type: 'address' },
      { name: 'proofHash', type: 'bytes32' },
      { name: 'passed', type: 'bool' },
      { name: 'details', type: 'string' }
    ],
    outputs: []
  },
  {
    type: 'function',
    name: 'getVerification',
    stateMutability: 'view',
    inputs: [{ name: 'jobId', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'jobId', type: 'uint256' },
          { name: 'agent', type: 'address' },
          { name: 'proofHash', type: 'bytes32' },
          { name: 'verified', type: 'bool' },
          { name: 'verifiedAt', type: 'uint256' },
          { name: 'verificationDetails', type: 'string' }
        ]
      }
    ]
  },
  {
    type: 'event',
    name: 'TaskVerified',
    inputs: [
      { name: 'jobId', type: 'uint256', indexed: true },
      { name: 'agent', type: 'address', indexed: true },
      { name: 'success', type: 'bool', indexed: false },
      { name: 'details', type: 'string', indexed: false }
    ]
  },
  {
    type: 'event',
    name: 'TaskRejected',
    inputs: [
      { name: 'jobId', type: 'uint256', indexed: true },
      { name: 'agent', type: 'address', indexed: true },
      { name: 'reason', type: 'string', indexed: false }
    ]
  }
] as const;

export const DEFAULT_TASK_EVALUATOR_ADDRESS = '0xE9a1000000000000000000000000000000000097' as `0x${string}`;
