import { Module, Logger } from '@nestjs/common';
import { ColorService } from './color.service';

@Module({
    providers: [ColorService, Logger],
    exports: [ColorService],
})
export class ColorModule {}
