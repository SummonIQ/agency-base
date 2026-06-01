import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { apiValidationService } from '@/lib/validation/api-validation-service';

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const service = searchParams.get('service');
    const includeEnv = searchParams.get('include_env') === 'true';

    if (service) {
      // Validate specific service
      const result = await apiValidationService.validateService(service);
      return NextResponse.json({
        success: true,
        validation: result,
      });
    } else {
      // Validate all services
      const systemValidation = await apiValidationService.validateAllAPIs();
      
      const response: any = {
        success: true,
        validation: systemValidation,
      };

      // Include environment variable status if requested
      if (includeEnv) {
        response.environment = apiValidationService.getEnvironmentStatus();
      }

      return NextResponse.json(response);
    }

  } catch (error) {
    console.error('API validation error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Validation failed' 
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, service } = body;

    switch (action) {
      case 'validate_service': {
        if (!service) {
          return NextResponse.json(
            { error: 'Service name is required' },
            { status: 400 }
          );
        }

        const result = await apiValidationService.validateService(service);
        return NextResponse.json({
          success: true,
          validation: result,
        });
      }

      case 'validate_all': {
        const systemValidation = await apiValidationService.validateAllAPIs();
        return NextResponse.json({
          success: true,
          validation: systemValidation,
        });
      }

      case 'get_environment_status': {
        const envStatus = apiValidationService.getEnvironmentStatus();
        return NextResponse.json({
          success: true,
          environment: envStatus,
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('API validation POST error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Validation failed' 
      },
      { status: 500 }
    );
  }
}
