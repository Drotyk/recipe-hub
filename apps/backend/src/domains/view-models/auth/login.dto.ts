import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';


@Exclude()
export class LoginDto {
    @IsEmail()
    @Type(() => String)
    @Expose()
    @ApiProperty({ example: 'test@email.com' })
    email: string;

    @MinLength(8)
    @IsString()
    @Expose()
    @ApiProperty({ example: 'SuperPwd123' })
    password: string;
}
