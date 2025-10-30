import { spawn } from 'child_process'
import { promisify } from 'util'

export interface PythonResult {
  code: number
  stdout: string
  stderr: string
}

export async function runPythonCommand(
  args: string[],
  cwd?: string,
  pythonPath?: string
): Promise<PythonResult> {
  const resolvedPython = pythonPath || process.env.PYTHON_PATH || 'python3'
  return new Promise((resolve) => {
    const python = spawn(resolvedPython, args, {
      cwd: cwd || process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''

    python.stdout?.on('data', (data) => {
      stdout += data.toString()
    })

    python.stderr?.on('data', (data) => {
      stderr += data.toString()
    })

    python.on('close', (code) => {
      resolve({
        code: code || 0,
        stdout,
        stderr,
      })
    })

    python.on('error', (error) => {
      resolve({
        code: 1,
        stdout: '',
        stderr: error.message,
      })
    })
  })
}
