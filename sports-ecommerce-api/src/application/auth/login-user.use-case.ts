import { UserRepository } from "../../domain/repositories/user.repository";
import { PasswordService } from "../../infrastructure/database/security/password.service";
import { JwtService } from "../../infrastructure/database/security/jwt.service";

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface LoginUserOutput {
  accessToken: string;

  user: {
    id: string;
    name: string;
    email: string;
  };
}

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(
    input: LoginUserInput,
  ): Promise<LoginUserOutput> {
    const email = input.email
      .trim()
      .toLowerCase();

    const user =
      await this.userRepository.findByEmail(
        email,
      );

    if (!user) {
      throw new Error(
        "Invalid credentials",
      );
    }

    const passwordValid =
      await this.passwordService.compare(
        input.password,
        user.passwordHash,
      );

    if (!passwordValid) {
      throw new Error(
        "Invalid credentials",
      );
    }

    const accessToken =
      this.jwtService.sign({
        sub: user.id,
        email: user.email,
      });

    return {
      accessToken,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
}