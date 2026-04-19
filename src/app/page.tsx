'use client';

import React, { useState } from 'react';

interface MoveOption {
  dx: number;
  dy: number;
  name: string;
  rotation: number;
}

interface Position {
  x: number;
  y: number;
}

interface MovePosition extends Position {
  rotation: number;
}

interface PlaneProps {
  x: number;
  y: number;
  rotation: number;
  color: string;
  health: number;
  selected: boolean;
  showRange: boolean;
  onClick: () => void;
}

interface Plane extends Position {
  rotation: number;
  color: string;
  health: number;
  team: number;
}

interface Shot {
  from: Plane;
  to: Plane;
}

const MOVE_OPTIONS: MoveOption[] = [
  { dx: 2, dy: 0, name: 'Forward', rotation: 0 },
  { dx: 3, dy: 0, name: 'Far Forward', rotation: 0 },
  { dx: 2, dy: 1, name: 'Slight Right', rotation: 30 },
  { dx: 2, dy: -1, name: 'Slight Left', rotation: -30 },
  { dx: 1, dy: 2, name: 'Sharp Right', rotation: 90 },
  { dx: 1, dy: -2, name: 'Sharp Left', rotation: -90 },
  { dx: -1, dy: 0, name: 'Backward', rotation: 180 },
];

const SHOOTING_RANGE = 2;
const INITIAL_HEALTH = 3;
const COLLISION_DISTANCE = 20;

const Plane: React.FC<PlaneProps> = ({ x, y, rotation, color, health, selected, onClick, showRange }) => {
  const hitBoxSize = 60;
  const rangeSize = SHOOTING_RANGE * 60;
  
  const planeRotation = rotation % 360;
  const coneAngle = 13;
  
  const leftPoint = {
    x: x + rangeSize * Math.cos((0 - coneAngle) * Math.PI / 180),
    y: y + rangeSize * Math.sin((0 - coneAngle) * Math.PI / 180)
  };
  
  const rightPoint = {
    x: x + rangeSize * Math.cos((0 + coneAngle) * Math.PI / 180),
    y: y + rangeSize * Math.sin((0 + coneAngle) * Math.PI / 180)
  };

  return (
    <g 
      transform={`rotate(${planeRotation}, ${x}, ${y})`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      {showRange && (
        <path
          d={`M ${x} ${y} 
              L ${leftPoint.x} ${leftPoint.y} 
              A ${rangeSize} ${rangeSize} 0 0 1 ${rightPoint.x} ${rightPoint.y} 
              Z`}
          fill={color}
          fillOpacity="0.1"
          stroke={color}
          strokeOpacity="0.3"
          strokeWidth="1"
          transform={`rotate(${planeRotation} + 5, ${x}, ${y})`}
        />
      )}
      <rect
        x={x - hitBoxSize/2}
        y={y - hitBoxSize/2}
        width={hitBoxSize}
        height={hitBoxSize}
        fill="transparent"
      />
      <path 
        d={`M ${x+20} ${y} L ${x-10} ${y-8} L ${x-10} ${y+8} Z`}
        fill={color}
        stroke={selected ? 'white' : 'none'}
        strokeWidth="2"
      />
      <text 
        x={x} 
        y={y-20} 
        textAnchor="middle" 
        fill="white" 
        fontSize="12"
        transform={`rotate(${-planeRotation}, ${x}, ${y})`}
      >
        HP: {health}
      </text>
    </g>
  );
};

interface MoveOptionProps {
  x: number;
  y: number;
  onClick: () => void;
}

const MoveOption: React.FC<MoveOptionProps> = ({ x, y, onClick }) => (
  <circle
    cx={x}
    cy={y}
    r="8"
    fill="rgba(255, 255, 255, 0.5)"
    stroke="white"
    strokeWidth="2"
    onClick={onClick}
    style={{ cursor: 'pointer' }}
  />
);

interface ShotLineProps {
  from: Position;
  to: Position;
  color: string;
}

const ShotLine: React.FC<ShotLineProps> = ({ from, to, color }) => (
  <line
    x1={from.x}
    y1={from.y}
    x2={to.x}
    y2={to.y}
    stroke={color}
    strokeWidth="2"
    strokeDasharray="5,5"
  >
    <animate
      attributeName="stroke-dashoffset"
      from="0"
      to="20"
      dur="0.5s"
      repeatCount="1"
    />
  </line>
);

const Game: React.FC = () => {
  const [planes, setPlanes] = useState<Plane[]>([
    { x: 300, y: 50, rotation: 90, color: '#4299e1', health: INITIAL_HEALTH, team: 1 },
    { x: 200, y: 50, rotation: 90, color: '#4299e1', health: INITIAL_HEALTH, team: 1 },
    { x: 400, y: 50, rotation: 90, color: '#4299e1', health: INITIAL_HEALTH, team: 1 },
    { x: 300, y: 350, rotation: 270, color: '#f56565', health: INITIAL_HEALTH, team: 2 },
    { x: 200, y: 350, rotation: 270, color: '#f56565', health: INITIAL_HEALTH, team: 2 },
    { x: 400, y: 350, rotation: 270, color: '#f56565', health: INITIAL_HEALTH, team: 2 },
  ]);
  
  const [selectedPlane, setSelectedPlane] = useState<number | null>(null);
  const [currentTeam, setCurrentTeam] = useState<number>(1);
  const [plannedMoves, setPlannedMoves] = useState<Record<number, MovePosition>>({});
  const [shots, setShots] = useState<Shot[]>([]);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const getMoveOptions = (plane: Plane): MovePosition[] => {
    return MOVE_OPTIONS.map(({ dx, dy, rotation: moveRotation }) => {
      const angle = (plane.rotation * Math.PI) / 180;
      const rotatedDx = dx * Math.cos(angle) + dy * Math.sin(angle);
      const rotatedDy = dx * Math.sin(angle) - dy * Math.cos(angle);
      
      return {
        x: plane.x + rotatedDx * 40,
        y: plane.y + rotatedDy * 40,
        rotation: ((plane.rotation - moveRotation) + 360) % 360
      };
    });
  };

  const handlePlaneClick = (index: number) => {
    if (planes[index].team !== currentTeam || planes[index].health <= 0 || isAnimating) return;
    setSelectedPlane(selectedPlane === index ? null : index);
  };

  const handleMoveSelect = (movePos: MovePosition) => {
    if (selectedPlane === null) return;
    setPlannedMoves({
      ...plannedMoves,
      [selectedPlane]: movePos
    });
    setSelectedPlane(null);
  };

  const calculateDistance = (p1: Position, p2: Position): number => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  };

  const isInFiringArc = (shooter: Plane, target: Plane): boolean => {
    const distance = calculateDistance(shooter, target);
    if (distance > SHOOTING_RANGE * 60) return false;
  
    const coneAngle = 17;
  
    const dx = target.x - shooter.x;
    const dy = target.y - shooter.y;
    const targetAngle = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
    const shooterAngle = shooter.rotation % 360;
    
    let angleDiff = Math.abs(targetAngle - shooterAngle);
    if (angleDiff > 180) angleDiff = 360 - angleDiff;
    
    return angleDiff <= coneAngle;
  };

  const checkCollisions = (newPlanes: Plane[]): void => {
    newPlanes.forEach((plane1, i) => {
      if (plane1.health <= 0) return;
      
      newPlanes.forEach((plane2, j) => {
        if (i === j || plane2.health <= 0) return;
        
        if (calculateDistance(plane1, plane2) < COLLISION_DISTANCE) {
          newPlanes[i].health = 0;
          newPlanes[j].health = 0;
        }
      });
    });
  };

  const executeMove = async (): Promise<void> => {
    if (Object.keys(plannedMoves).length === 0 || isAnimating) return;
    setIsAnimating(true);
    setShots([]);

    const newPlanes = [...planes];
    const newShots: Shot[] = [];
    
    Object.entries(plannedMoves).forEach(([planeIndex, newPos]) => {
      const index = parseInt(planeIndex);
      newPlanes[index] = {
        ...newPlanes[index],
        x: newPos.x,
        y: newPos.y,
        rotation: newPos.rotation
      };
    });

    checkCollisions(newPlanes);

    newPlanes.forEach((shooter) => {
      if (shooter.health <= 0 || shooter.team !== currentTeam) return;
      
      newPlanes.forEach((target, targetIndex) => {
        if (
          shooter.team !== target.team && 
          target.health > 0 &&
          isInFiringArc(shooter, target)
        ) {
          newPlanes[targetIndex].health -= 1;
          newShots.push({ from: shooter, to: target });
        }
      });
    });

    setPlanes(newPlanes);
    setShots(newShots);
    
    await new Promise(resolve => setTimeout(resolve, 900));
    
    setShots([]);
    setPlannedMoves({});
    setCurrentTeam(currentTeam === 1 ? 2 : 1);
    setIsAnimating(false);
  };

  const resetGame = (): void => {
    setPlanes([
      { x: 300, y: 50, rotation: 90, color: '#4299e1', health: INITIAL_HEALTH, team: 1 },
      { x: 200, y: 50, rotation: 90, color: '#4299e1', health: INITIAL_HEALTH, team: 1 },
      { x: 400, y: 50, rotation: 90, color: '#4299e1', health: INITIAL_HEALTH, team: 1 },
      { x: 300, y: 350, rotation: 270, color: '#f56565', health: INITIAL_HEALTH, team: 2 },
      { x: 200, y: 350, rotation: 270, color: '#f56565', health: INITIAL_HEALTH, team: 2 },
      { x: 400, y: 350, rotation: 270, color: '#f56565', health: INITIAL_HEALTH, team: 2 },
    ]);
    setSelectedPlane(null);
    setCurrentTeam(1);
    setPlannedMoves({});
    setShots([]);
    setIsAnimating(false);
  };

  const checkGameOver = (): string | null => {
    const team1Alive = planes.some(p => p.team === 1 && p.health > 0);
    const team2Alive = planes.some(p => p.team === 2 && p.health > 0);
    
    if (!team1Alive) return "Red Team Wins!";
    if (!team2Alive) return "Blue Team Wins!";
    return null;
  };

  return (
    <div className="flex flex-col items-center bg-gray-900 p-4 rounded-lg">
      <div className="mb-4 text-white text-lg">
        {currentTeam === 1 ? "Blue Team's Turn" : "Red Team's Turn"}
      </div>
      
      <svg width="600" height="400" className="bg-gray-800 rounded-lg mb-4">
        {Object.entries(plannedMoves).map(([planeIndex, pos]) => (
          <line
            key={planeIndex}
            x1={planes[parseInt(planeIndex)].x}
            y1={planes[parseInt(planeIndex)].y}
            x2={pos.x}
            y2={pos.y}
            stroke={planes[parseInt(planeIndex)].color}
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        ))}

        {planes.map((plane, index) => (
          <Plane
            key={index}
            x={plane.x}
            y={plane.y}
            rotation={plane.rotation}
            color={plane.color}
            health={plane.health}
            selected={selectedPlane === index}
            showRange={selectedPlane === index}
            onClick={() => handlePlaneClick(index)}
          />
        ))}
        
        {selectedPlane !== null && planes[selectedPlane].health > 0 && 
          getMoveOptions(planes[selectedPlane]).map((pos, index) => (
            <MoveOption
              key={index}
              x={pos.x}
              y={pos.y}
              onClick={() => handleMoveSelect(pos)}
            />
          ))
        }

        {shots.map((shot, index) => (
          <ShotLine
            key={index}
            from={shot.from}
            to={shot.to}
            color={shot.from.color}
          />
        ))}
      </svg>

      <div className="flex gap-4">
        <button 
          onClick={executeMove}
          disabled={Object.keys(plannedMoves).length === 0 || isAnimating}
          className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Execute Moves
        </button>
        <button 
          onClick={resetGame}
          className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Reset Game
        </button>
      </div>

      {checkGameOver() && (
        <div className="mt-4 text-white text-xl font-bold">
          {checkGameOver()}
        </div>
      )}
    </div>
  );
};

export default Game;