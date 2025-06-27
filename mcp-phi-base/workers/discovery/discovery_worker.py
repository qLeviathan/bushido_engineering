#!/usr/bin/env python3
"""
Discovery Worker - Pattern Recognition and Equation Generation
Implements φ-recursive discovery through RabbitMQ pipeline
"""

import os
import json
import time
import asyncio
from datetime import datetime
from typing import Dict, List, Optional

import numpy as np
import pika
import redis
import psycopg2
from dotenv import load_dotenv
import structlog

# Load environment
load_dotenv()

# Configure structured logging
logger = structlog.get_logger()

# Mathematical constants
PHI = 1.618033988749895
PSI = 0.618033988749894
LN_PHI = 0.4812118250

class DiscoveryWorker:
    def __init__(self, worker_type: str):
        self.worker_type = worker_type
        self.phase = self._determine_phase(worker_type)
        
        # Connect to services
        self.redis_client = self._connect_redis()
        self.rabbit_conn = self._connect_rabbitmq()
        self.pg_conn = self._connect_postgres()
        
        # Set up RabbitMQ
        self.channel = self.rabbit_conn.channel()
        self._setup_exchanges()
        
        logger.info("discovery_worker_initialized", 
                   worker_type=worker_type, 
                   phase=self.phase)
    
    def _determine_phase(self, worker_type: str) -> str:
        """Map worker type to temporal phase"""
        phases = {
            "pattern_recognizer": "past",
            "equation_generator": "present",
            "phase_optimizer": "future"
        }
        return phases.get(worker_type, "present")
    
    def _connect_redis(self):
        """Connect to Redis for shared state"""
        return redis.Redis(
            host=os.getenv('REDIS_HOST'),
            port=int(os.getenv('REDIS_PORT')),
            password=os.getenv('REDIS_PASSWORD'),
            decode_responses=True
        )
    
    def _connect_rabbitmq(self):
        """Connect to RabbitMQ for discovery pipeline"""
        credentials = pika.PlainCredentials(
            os.getenv('RABBITMQ_USER'),
            os.getenv('RABBITMQ_PASSWORD')
        )
        parameters = pika.ConnectionParameters(
            host=os.getenv('RABBITMQ_HOST'),
            port=int(os.getenv('RABBITMQ_PORT')),
            virtual_host=os.getenv('RABBITMQ_VHOST'),
            credentials=credentials
        )
        return pika.BlockingConnection(parameters)
    
    def _connect_postgres(self):
        """Connect to PostgreSQL for persistent storage"""
        return psycopg2.connect(
            host=os.getenv('POSTGRES_HOST'),
            port=os.getenv('POSTGRES_PORT'),
            database=os.getenv('POSTGRES_DB'),
            user=os.getenv('POSTGRES_USER'),
            password=os.getenv('POSTGRES_PASSWORD')
        )
    
    def _setup_exchanges(self):
        """Set up RabbitMQ exchanges and queues"""
        # Declare topic exchange for discovery
        self.channel.exchange_declare(
            exchange='phi.discovery',
            exchange_type='topic',
            durable=True
        )
        
        # Create worker-specific queue
        queue_name = f'discovery.{self.worker_type}'
        self.channel.queue_declare(queue=queue_name, durable=True)
        
        # Bind with routing key based on phase
        routing_key = f'discovery.{self.phase}.*'
        self.channel.queue_bind(
            exchange='phi.discovery',
            queue=queue_name,
            routing_key=routing_key
        )
        
        # Set up consumer
        self.channel.basic_consume(
            queue=queue_name,
            on_message_callback=self.process_discovery,
            auto_ack=False
        )
    
    def compute_betti_vector(self, equation: str) -> List[int]:
        """Compute Betti numbers for equation topology"""
        b0 = equation.count('=') + 1  # Components
        b1 = equation.count('(') // 2  # Cycles
        b2 = equation.count('∫')  # Voids
        return [b0, b1, b2]
    
    def check_phase_lock(self) -> float:
        """Check phase coherence with other workers"""
        # Get phase states from Redis
        phases = []
        for key in self.redis_client.keys('phase:*'):
            phase_data = self.redis_client.get(key)
            if phase_data:
                phases.append(float(phase_data))
        
        if not phases:
            return 0.0
        
        # Calculate coherence
        coherence = np.std(phases)
        return 1.0 - min(coherence / PSI, 1.0)
    
    def process_discovery(self, channel, method, properties, body):
        """Process discovery message from RabbitMQ"""
        try:
            data = json.loads(body)
            logger.info("processing_discovery", 
                       worker=self.worker_type,
                       equation=data.get('equation'))
            
            # Compute Betti vector
            betti = self.compute_betti_vector(data['equation'])
            chi = betti[0] - betti[1] + betti[2]
            
            # Check topology constraint
            if chi > 1:
                logger.warning("topology_violation", chi=chi)
                channel.basic_nack(delivery_tag=method.delivery_tag)
                return
            
            # Process based on worker type
            if self.worker_type == "pattern_recognizer":
                result = self._recognize_patterns(data)
            elif self.worker_type == "equation_generator":
                result = self._generate_equations(data)
            elif self.worker_type == "phase_optimizer":
                result = self._optimize_phase(data)
            
            # Update Redis state
            self._update_shared_state(result)
            
            # Route to next stage
            self._route_discovery(result)
            
            # Acknowledge message
            channel.basic_ack(delivery_tag=method.delivery_tag)
            
        except Exception as e:
            logger.error("discovery_error", error=str(e))
            channel.basic_nack(delivery_tag=method.delivery_tag)
    
    def _recognize_patterns(self, data: Dict) -> Dict:
        """Pattern recognition (past phase)"""
        equation = data['equation']
        
        # Look for φ-patterns
        patterns = []
        if 'φ' in equation or 'phi' in equation.lower():
            patterns.append('golden_ratio')
        if any(op in equation for op in ['∇²', 'd²/dx²']):
            patterns.append('laplacian')
        if '∫' in equation:
            patterns.append('integral')
        
        return {
            **data,
            'patterns': patterns,
            'phase': 'past',
            'timestamp': datetime.utcnow().isoformat(),
            'worker': self.worker_type
        }
    
    def _generate_equations(self, data: Dict) -> Dict:
        """Equation generation (present phase)"""
        patterns = data.get('patterns', [])
        
        # Generate derived equations
        derived = []
        if 'golden_ratio' in patterns:
            derived.append('φ² = φ + 1')
            derived.append('φ = (1 + √5)/2')
        
        return {
            **data,
            'derived_equations': derived,
            'phase': 'present',
            'confidence': 0.8 + np.random.random() * 0.2,
            'worker': self.worker_type
        }
    
    def _optimize_phase(self, data: Dict) -> Dict:
        """Phase optimization (future phase)"""
        # Check phase lock
        coherence = self.check_phase_lock()
        
        # Predict implications
        implications = []
        if data.get('confidence', 0) > PSI:
            implications.append('validates_golden_structure')
        
        return {
            **data,
            'phase_lock': coherence,
            'implications': implications,
            'phase': 'future',
            'optimized': True,
            'worker': self.worker_type
        }
    
    def _update_shared_state(self, result: Dict):
        """Update Redis with discovery state"""
        # Update phase state
        phase_key = f"phase:{self.worker_type}"
        self.redis_client.setex(phase_key, 60, str(time.time()))
        
        # Update last discovery
        if result.get('confidence', 0) > PSI:
            self.redis_client.hset('last_discovery', mapping={
                'equation': result['equation'],
                'confidence': result['confidence'],
                'timestamp': result['timestamp']
            })
        
        # Update chi coherence
        if 'betti' in result:
            chi = result['betti'][0] - result['betti'][1] + result['betti'][2]
            self.redis_client.set('chi_current', chi)
    
    def _route_discovery(self, result: Dict):
        """Route to next stage in discovery pipeline"""
        # Determine next routing
        if result['phase'] == 'past':
            routing_key = 'discovery.present.equation'
        elif result['phase'] == 'present':
            routing_key = 'discovery.future.optimize'
        else:
            routing_key = 'validation.request'
        
        # Publish to exchange
        self.channel.basic_publish(
            exchange='phi.discovery',
            routing_key=routing_key,
            body=json.dumps(result),
            properties=pika.BasicProperties(
                delivery_mode=2  # Persistent
            )
        )
    
    def run(self):
        """Run the discovery worker"""
        logger.info("discovery_worker_starting", worker=self.worker_type)
        
        try:
            self.channel.start_consuming()
        except KeyboardInterrupt:
            logger.info("discovery_worker_stopping")
            self.channel.stop_consuming()
            self.rabbit_conn.close()
            self.pg_conn.close()

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: discovery_worker.py <worker_type>")
        print("Types: pattern_recognizer, equation_generator, phase_optimizer")
        sys.exit(1)
    
    worker = DiscoveryWorker(sys.argv[1])
    worker.run()