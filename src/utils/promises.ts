type Result<T, E = Error> = Success<T> | Failure<E>
type Success<T> = { data: T; error: null }
type Failure<E> = { data: null; error: E }

export const wait = async (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function tryCatch<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>> {
  try {
    return { data: await promise, error: null }
  } catch (error) {
    return { error: error as E, data: null }
  }
}
