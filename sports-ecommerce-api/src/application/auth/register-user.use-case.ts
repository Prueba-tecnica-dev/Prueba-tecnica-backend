import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";

import { UserRepository } from "../../domain/repositories/user.repository";
import { User } from "../../domain/entities/user.entity";

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  async execute(
    input: RegisterUserInput,
  ): Promise<Omit<User, "passwordHash">> {
    const email = input.email
      .trim()
      .toLowerCase();

    const existingUser =
      await this.userRepository.findByEmail(
        email,
      );

    if (existingUser) {
      throw new Error(
        "User already exists",
      );
    }

    const passwordHash =
      await bcrypt.hash(
        input.password,
        12,
      );

    const user: User = {
      id: randomUUID(),

      name: input.name.trim(),

      email,

      passwordHash,

      createdAt:
        new Date().toISOString(),
    };

    const createdUser =
      await this.userRepository.create(
        user,
      );

    return {
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      createdAt: createdUser.createdAt,
    };
  }
}