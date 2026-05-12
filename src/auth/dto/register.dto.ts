import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  @Length(2, 20)
  username: string = '';

  @IsEmail()
  @IsNotEmpty()
  email: string = '';

  @IsNotEmpty()
  @IsString()
  @Length(6, 20)
  password: string = '';
}
