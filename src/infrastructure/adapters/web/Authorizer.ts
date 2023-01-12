import { authorizeUseCase } from '../../../usecases/authorize';

/**
 * @description Lambda handler function to run our authorization use case.
 */
export async function handler(event: Record<string, any>): Promise<any> {
  return await authorizeUseCase(event as any);
}
