import { Module } from '@nestjs/common';
import { BienSubscriber } from './bien.subscriber';
import { ResponsableSubscriber } from './responsable.subscriber';
import { TransferenciaSubscriber } from './transferencia.subscriber';

@Module({
    providers: [
        BienSubscriber,
        ResponsableSubscriber,
        TransferenciaSubscriber,
    ],
})
export class SubscribersModule { }
