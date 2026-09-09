import solcx, json, os

solcx.set_solc_version('0.8.20')

base_dir = os.path.dirname(os.path.abspath(__file__))
escrow_path = os.path.join(base_dir, 'ERC8183Escrow.sol')
evaluator_path = os.path.join(base_dir, 'TaskEvaluator.sol')
registry_path = os.path.join(base_dir, 'AgentRegistry.sol')

print('Compiling contracts...')
compiled = solcx.compile_files(
    [escrow_path, evaluator_path, registry_path],
    output_values=['abi', 'bin'],
    solc_version='0.8.20',
    optimize=True,
    optimize_runs=200
)

output_data = {}
for contract_key, data in compiled.items():
    contract_name = contract_key.split(':')[-1]
    output_data[contract_name] = {
        'abi': data['abi'],
        'bytecode': '0x' + data['bin']
    }
    print(f'Compiled: {contract_name} (Bytecode length: {len(data["bin"])} hex chars)')

out_file = os.path.join(base_dir, 'compiled_contracts.json')
with open(out_file, 'w') as f:
    json.dump(output_data, f, indent=2)

print(f'Successfully compiled and saved to {out_file}')
