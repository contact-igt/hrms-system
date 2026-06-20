type AvatarStackProps = {
  members: string[];
};

const avatarTones = [
  "avatar-warm",
  "avatar-blue",
  "avatar-gold",
  "avatar-pink",
  "avatar-green",
];

export function AvatarStack({ members }: AvatarStackProps) {
  return (
    <div className="avatar-stack" aria-label={`${members.length} project members`}>
      {members.map((member, index) => (
        <span
          className={`avatar ${avatarTones[index % avatarTones.length]}`}
          key={`${member}-${index}`}
          title={member}
        >
          {member}
        </span>
      ))}
    </div>
  );
}
