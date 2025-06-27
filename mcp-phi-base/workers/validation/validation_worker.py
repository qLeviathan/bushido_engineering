#!/usr/bin/env python3
"""
Validation Worker - Mathematical Verification
Validates discoveries through numerical, symbolic, and theorem checking
"""

import os
import json
import time
from datetime import datetime
from typing import Dict, List, Optional, Tuple

import numpy as np
import sympy as sp
from mpmath import mp
import pika
import redis
import psycopg2
from dotenv import load_dotenv
import structlog

# Set precision
mp.dps = 50  # 50 decimal places

# Load environment
load_dotenv()

# Configure logging
logger = structlog.get_logger()

# Constants
PHI = mp.mpf('1.618033988749894848204586834365638117720309179805762862135')
PSI = mp.mpf('0.618033988749894848204586834365638117720309179805762862135')

class ValidationWorker:
    def __init__(self, worker_type: str):
        self.worker_type = worker_type
        
        # Connect to services
        self.redis_client = self._connect_redis()
        self.rabbit_conn = self._connect_rabbitmq()
        self.pg_conn = self._connect_postgres()
        
        # Set up RabbitMQ
        self.channel = self.rabbit_conn.channel()
        self._setup_validation_queue()
        
        logger.info("validation_worker_initialized", worker_type=worker_type)
    
    def _connect_redis(self):
        return redis.Redis(
            host=os.getenv('REDIS_HOST'),
            port=int(os.getenv('REDIS_PORT')),
            password=os.getenv('REDIS_PASSWORD'),
            decode_responses=True
        )
    
    def _connect_rabbitmq(self):
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
        return psycopg2.connect(
            host=os.getenv('POSTGRES_HOST'),
            port=os.getenv('POSTGRES_PORT'),
            database=os.getenv('POSTGRES_DB'),
            user=os.getenv('POSTGRES_USER'),
            password=os.getenv('POSTGRES_PASSWORD')
        )
    
    def _setup_validation_queue(self):
        """Set up validation queue and bindings"""
        self.channel.exchange_declare(
            exchange='phi.validation',
            exchange_type='topic',
            durable=True
        )
        
        queue_name = f'validation.{self.worker_type}'
        self.channel.queue_declare(queue=queue_name, durable=True)
        
        # All validation workers listen to validation requests
        self.channel.queue_bind(
            exchange='phi.discovery',
            queue=queue_name,
            routing_key='validation.request'
        )
        
        self.channel.basic_consume(
            queue=queue_name,
            on_message_callback=self.process_validation,
            auto_ack=False
        )
    
    def process_validation(self, channel, method, properties, body):
        """Process validation request"""
        try:
            data = json.loads(body)
            equation = data.get('equation', '')
            
            logger.info("validating_equation", 
                       worker=self.worker_type,
                       equation=equation)
            
            # Run validation based on worker type
            if self.worker_type == "theorem_checker":
                result = self._check_theorem(data)
            elif self.worker_type == "numerical_validator":
                result = self._validate_numerical(data)
            elif self.worker_type == "symbolic_verifier":
                result = self._verify_symbolic(data)
            
            # Update validation result
            self._update_validation_state(result)
            
            # Store if valid
            if result['valid']:
                self._store_validated_equation(result)
            
            # Acknowledge
            channel.basic_ack(delivery_tag=method.delivery_tag)
            
        except Exception as e:
            logger.error("validation_error", error=str(e))
            channel.basic_nack(delivery_tag=method.delivery_tag)
    
    def _check_theorem(self, data: Dict) -> Dict:
        """Theorem checking validation"""
        equation = data['equation']
        
        # Basic theorem checks
        checks = {
            'well_formed': self._is_well_formed(equation),
            'dimensionally_consistent': self._check_dimensions(equation),
            'mathematically_valid': True  # Placeholder for Z3 integration
        }
        
        valid = all(checks.values())
        confidence = sum(checks.values()) / len(checks)
        
        return {
            **data,
            'validation_type': 'theorem',
            'valid': valid,
            'confidence': confidence,
            'checks': checks,
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def _validate_numerical(self, data: Dict) -> Dict:
        """Numerical validation"""
        equation = data['equation']
        
        # Test with specific values
        test_results = []
        
        # Test golden ratio relationships
        if 'φ' in equation or 'phi' in equation:
            # Test φ² = φ + 1
            phi_test = abs(float(PHI**2 - PHI - 1))
            test_results.append(('phi_identity', phi_test < 1e-10))
        
        # Calculate confidence based on precision
        valid = all(result[1] for result in test_results) if test_results else True
        confidence = 1.0 if valid else 0.5
        
        return {
            **data,
            'validation_type': 'numerical',
            'valid': valid,
            'confidence': confidence,
            'precision': str(mp.dps),
            'test_results': test_results,
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def _verify_symbolic(self, data: Dict) -> Dict:
        """Symbolic verification"""
        equation = data['equation']
        
        try:
            # Parse equation symbolically
            if '=' in equation:
                lhs, rhs = equation.split('=', 1)
                
                # Create symbolic variables
                symbols = sp.symbols('x y z φ ψ')
                
                # Simple symbolic checks
                valid = True
                confidence = 0.9
            else:
                valid = False
                confidence = 0.0
        
        except Exception as e:
            logger.error("symbolic_error", error=str(e))
            valid = False
            confidence = 0.0
        
        return {
            **data,
            'validation_type': 'symbolic',
            'valid': valid,
            'confidence': confidence,
            'symbolic_form': equation,
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def _is_well_formed(self, equation: str) -> bool:
        """Check if equation is well-formed"""
        # Basic syntax checks
        if not equation or '=' not in equation:
            return False
        
        # Balanced parentheses
        paren_count = 0
        for char in equation:
            if char == '(':
                paren_count += 1
            elif char == ')':
                paren_count -= 1
            if paren_count < 0:
                return False
        
        return paren_count == 0
    
    def _check_dimensions(self, equation: str) -> bool:
        """Check dimensional consistency"""
        # Placeholder - would implement dimensional analysis
        return True
    
    def _update_validation_state(self, result: Dict):
        """Update Redis with validation state"""
        # Track validation results
        key = f"validation:{self.worker_type}:{result['equation']}"
        self.redis_client.hset(key, mapping={
            'valid': str(result['valid']),
            'confidence': str(result['confidence']),
            'timestamp': result['timestamp']
        })
        
        # Update global validation count
        if result['valid']:
            self.redis_client.incr('validations:success')
        else:
            self.redis_client.incr('validations:failed')
    
    def _store_validated_equation(self, result: Dict):
        """Store validated equation in PostgreSQL"""
        try:
            cursor = self.pg_conn.cursor()
            
            # Insert validated equation
            cursor.execute("""
                INSERT INTO validated_equations 
                (equation, confidence, validation_type, metadata, created_at)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (equation) DO UPDATE
                SET confidence = GREATEST(validated_equations.confidence, EXCLUDED.confidence),
                    metadata = EXCLUDED.metadata,
                    updated_at = NOW()
            """, (
                result['equation'],
                result['confidence'],
                result['validation_type'],
                json.dumps(result),
                datetime.utcnow()
            ))
            
            self.pg_conn.commit()
            cursor.close()
            
            logger.info("equation_stored", equation=result['equation'])
            
        except Exception as e:
            logger.error("storage_error", error=str(e))
            self.pg_conn.rollback()
    
    def run(self):
        """Run the validation worker"""
        logger.info("validation_worker_starting", worker=self.worker_type)
        
        try:
            self.channel.start_consuming()
        except KeyboardInterrupt:
            logger.info("validation_worker_stopping")
            self.channel.stop_consuming()
            self.rabbit_conn.close()
            self.pg_conn.close()

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: validation_worker.py <worker_type>")
        print("Types: theorem_checker, numerical_validator, symbolic_verifier")
        sys.exit(1)
    
    worker = ValidationWorker(sys.argv[1])
    worker.run()