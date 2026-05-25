import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MinLength,
    Validate,
    ValidationArguments,
    ValidatorConstraint, ValidatorConstraintInterface,
} from 'class-validator';


@ValidatorConstraint({ name: 'doesMatchPassword', async: false })
export class DoesMatchPassword implements ValidatorConstraintInterface {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validate (_: any, args: ValidationArguments): boolean {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const obj = args.object as any;

        return obj.password === obj.repeatedPassword;
    }

    defaultMessage (): string {
        return 'Passwords do not match';
    }
}

@Exclude()
export class RegisterDto {
    @IsEmail()
    @Type(() => String)
    @Expose()
    @ApiProperty({ example: 'test@email.com' })
    email: string;

    @IsNotEmpty()
    @Type(() => String)
    @Expose()
    @ApiProperty({ example: 'John Doe' })
    name: string;

    @MinLength(8)
    @IsString()
    @Expose()
    @ApiProperty({ example: 'SuperPwd123' })
    password: string;

    @Validate(DoesMatchPassword)
    @Type(() => String)
    @Expose()
    @ApiProperty({ example: 'SuperPwd123' })
    repeatedPassword: string;
}
