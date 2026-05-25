import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';


@Exclude()
export class CreateUserDto {
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
}
