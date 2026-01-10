/// Okada Platform - Auth Package
/// 
/// This package contains authentication, session management, and security
/// features for the Okada Platform apps.
/// 
/// Features:
/// - Phone-based OTP authentication
/// - Biometric authentication (fingerprint, face ID)
/// - Guest browsing mode
/// - Password recovery flow
/// - Onboarding flow management
library okada_auth;

// Models - Core
export 'src/models/user.dart';
export 'src/models/auth_tokens.dart';
export 'src/models/auth_state.dart';
export 'src/models/phone_number.dart';

// Models - New
export 'src/models/auth_result.dart';
export 'src/models/auth_user.dart';
export 'src/models/otp_verification.dart';

// Services - Core
export 'src/services/auth_repository.dart';
export 'src/services/session_manager.dart';
export 'src/services/otp_service.dart';
export 'src/services/biometric_service.dart';

// Services - New
export 'src/services/phone_auth_service.dart';
export 'src/services/guest_session_service.dart';
export 'src/services/password_recovery_service.dart';
export 'src/services/onboarding_service.dart';

// BLoC
export 'src/bloc/auth_bloc.dart';
export 'src/bloc/auth_event.dart';
export 'src/bloc/auth_state.dart';
export 'src/bloc/otp_bloc.dart';
