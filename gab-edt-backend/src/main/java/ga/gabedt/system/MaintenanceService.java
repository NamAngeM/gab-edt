package ga.gabedt.system;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class MaintenanceService {

    static final String KEY = "maintenance_mode";

    private final PlatformSettingRepository repository;

    @Transactional(readOnly = true)
    public boolean isEnabled() {
        return repository.findById(KEY).map(s -> Boolean.parseBoolean(s.getValue())).orElse(false);
    }

    @Transactional
    public void setEnabled(boolean enabled) {
        PlatformSetting setting = repository.findById(KEY).orElseGet(() -> new PlatformSetting(KEY, "false", LocalDateTime.now()));
        setting.setValue(String.valueOf(enabled));
        setting.setUpdatedAt(LocalDateTime.now());
        repository.save(setting);
    }
}
